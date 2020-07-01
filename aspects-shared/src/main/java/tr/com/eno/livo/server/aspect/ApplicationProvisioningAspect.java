package tr.com.eno.livo.server.aspect;

import java.beans.BeanInfo;
import java.beans.IntrospectionException;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
import java.util.Collections;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.osgi.service.event.Event;
import org.osgi.service.event.EventAdmin;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tr.com.eno.livo.server.application.Application;
import tr.com.eno.livo.server.application.ApplicationDeploymentFailedException;
import tr.com.eno.livo.server.application.ApplicationService;

/**
 *
 * @author dacay
 */
@Aspect
public class ApplicationProvisioningAspect {

    @Pointcut("execution(* tr.com.eno..ApplicationService+.deployApplication(tr.com.eno.livo.server.application.Application)) && args(application)")
    public void deployApplicationPointcut(Application application) {
    }

    @Around("deployApplicationPointcut(application)")
    public void deployApplicationAdvice(ProceedingJoinPoint joinPoint, Application application) throws IntrospectionException, Throwable {

        Class declaringType = joinPoint.getSignature().getDeclaringType();

        Logger logger = LoggerFactory.getLogger(declaringType.getName());

        BeanInfo beanInfo = Introspector.getBeanInfo(declaringType);

        PropertyDescriptor[] propertyDescriptors = beanInfo.getPropertyDescriptors();

        EventAdmin eventAdmin = null;

        for (PropertyDescriptor descriptor : propertyDescriptors) {

            if (EventAdmin.class.isAssignableFrom(descriptor.getPropertyType())) {

                Method readMethod = descriptor.getReadMethod();

                eventAdmin = (EventAdmin) readMethod.invoke(joinPoint.getTarget());

                break;
            }
        }

        if (eventAdmin == null) {

            logger.error("EventAdmin reference is needed in ApplicationService implementations.");

            throw new RuntimeException("EventAdmin reference is missing in ApplicationService implementation.");
        }

        try {

            joinPoint.proceed(new Object[]{application});

            logger.debug("Firing event for the deployment of application '{}' of domain '{}'...", application.getName(), application.getDomain());

            Event event = new Event(ApplicationService.APPLICATION_DEPLOYED_EVENT_TOPIC, Collections.singletonMap("application", application));

            eventAdmin.sendEvent(event);

        } catch (Throwable ex) {

            logger.error("Failed to deploy application '{}' of domain '{}'.", application.getName(), application.getDomain());

            logger.error(ex.getMessage(), ex);

            throw new ApplicationDeploymentFailedException();
        }
    }
}
