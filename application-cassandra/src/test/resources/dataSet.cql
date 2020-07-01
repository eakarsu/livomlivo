CREATE KEYSPACE IF NOT EXISTS application WITH replication = { 'class': 'SimpleStrategy', 'replication_factor': 1 };

CREATE TABLE IF NOT EXISTS application.applications (domain text, name text, authorization_policy int, freeform boolean, asset_paths set<text>, screen_ids set<text>, theme_id text, PRIMARY KEY (domain, name));
CREATE TABLE IF NOT EXISTS application.deployments (application_domain text, application_name text, time timeuuid, data blob, PRIMARY KEY (application_domain, application_name, time));
CREATE TABLE IF NOT EXISTS application.authorized_users (application_domain text, application_name text, user_domain text, user_id text, PRIMARY KEY (application_domain, application_name, user_domain, user_id));
CREATE TABLE IF NOT EXISTS application.authorized_user_groups (application_domain text, application_name text, group_domain text, group_name text, PRIMARY KEY (application_domain, application_name, group_domain, group_name));

INSERT INTO application.applications (domain, name, authorization_policy, freeform, asset_paths, screen_ids, theme_id) VALUES ('default', 'application1', 0, true, {}, {}, null);
INSERT INTO application.applications (domain, name, authorization_policy, freeform, asset_paths, screen_ids, theme_id) VALUES ('default', 'application2', 1, false, {}, {}, null);
INSERT INTO application.applications (domain, name, authorization_policy, freeform, asset_paths, screen_ids, theme_id) VALUES ('someDomain', 'application3', 2, true, {}, {}, null);
