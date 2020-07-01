<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%@ taglib prefix="sec"
	uri="http://www.springframework.org/security/tags"%>

<!--<div class="row">-->
<div class="col-md-12">
	<h2>Profile</h2>
</div>
<!--/col-md-12-->
<!--</div>/row-->

<!--<div class="row">-->
<div class="col-md-4">
	<div class="block-web">
		<div class="user-profile-sidebar">
			<div class="row">
				<div class="col-md-4">
					<img alt="Avatar" class="img-circle" src="images/logo.png">
				</div>
				<div class="col-md-8">
					<div class="user-identity">
						<h4>
							<strong>John Doe</strong>
						</h4>
						<p>
							<i class="fa fa-map-marker"></i> Riaxe Systems Pvt
						</p>
					</div>
				</div>
			</div>
		</div>
		<div class="account-status-data">
			<div class="row">
				<div class="col-md-4">
					<h5>
						<strong>2,173</strong> Posts
					</h5>
				</div>
				<div class="col-md-4">
					<h5>
						<strong>14</strong> Following
					</h5>
				</div>
				<div class="col-md-4">
					<h5>
						<strong>100</strong> Followers
					</h5>
				</div>
			</div>
		</div>
		<div class="user-button">
			<div class="row">
				<div class="col-md-6">
					<button class="btn btn-primary btn-sm btn-block" type="button">
						<i class="fa fa-envelope"></i> Send Message
					</button>
				</div>
				<div class="col-md-6">
					<button class="btn btn-default btn-sm btn-block" type="button">
						<i class="fa fa-user"></i> Add as friend
					</button>
				</div>
			</div>
		</div>
		<h5>CONNECTION</h5>
		<div id="social">
			<a title="Facebook" data-toggle="" href="#"> <span
				class="fa-stack fa-lg"> <i
					class="fa fa-circle facebook fa-stack-2x"></i> <i
					class="fa fa-facebook fa-stack-1x fa-inverse"></i>
			</span>
			</a> <a title="Twitter" data-toggle="tooltip" href="#"> <span
				class="fa-stack fa-lg"> <i
					class="fa fa-circle twitter fa-stack-2x"></i> <i
					class="fa fa-twitter fa-stack-1x fa-inverse"></i>
			</span>
			</a> <a title="Google Plus" data-toggle="tooltip" href="#"> <span
				class="fa-stack fa-lg"> <i
					class="fa fa-circle gplus fa-stack-2x"></i> <i
					class="fa fa-google-plus fa-stack-1x fa-inverse"></i>
			</span>
			</a> <a title="Tumblr" data-toggle="" href="#"> <span
				class="fa-stack fa-lg"> <i
					class="fa fa-circle tumblr fa-stack-2x"></i> <i
					class="fa fa-tumblr fa-stack-1x fa-inverse"></i>
			</span>
			</a> <a title="" data-toggle="" href="#" data-original-title="Linkedin">
				<span class="fa-stack fa-lg"> <i
					class="fa fa-circle linkedin fa-stack-2x"></i> <i
					class="fa fa-linkedin fa-stack-1x fa-inverse"></i>
			</span>
			</a>
		</div>
	</div>
	<!--/block-web-->
</div>
<!--/col-md-4-->

<div class="col-md-8">
	<div class="block-web full">
		<ul class="nav nav-tabs nav-justified">
			<li class="active"><a data-toggle="tab" href="#about"><i
					class="fa fa-user"></i> About</a></li>
			<li><a data-toggle="tab" href="#edit-profile"><i
					class="fa fa-pencil"></i> Edit</a></li>
			<li><a data-toggle="tab" href="#user-activities"><i
					class="fa fa-laptop"></i> Activities</a></li>
			<li><a data-toggle="tab" href="#mymessage"><i
					class="fa fa-envelope"></i> Message</a></li>
		</ul>

		<div class="tab-content">
			<div id="about" class="tab-pane active animated fadeInRight">
				<div class="user-profile-content">
					<h5>
						<strong>ABOUT</strong> ME
					</h5>
					<p>Lorem ipsum dolor sit amet, consectetuer adipiscing elit,
						sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna
						aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud
						exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea
						commodo consequat.</p>
					<hr>
					<div class="row">
						<div class="col-sm-6">
							<h5>
								<strong>CONTACT</strong> ME
							</h5>
							<address>
								<strong>Phone</strong><br> <abbr title="Phone">+91
									354 123 4567</abbr>
							</address>
							<address>
								<strong>Email</strong><br> <a href="mailto:#">first.last@example.com</a>
							</address>
							<address>
								<strong>Website</strong><br> <a href="http://riaxe.com">http://riaxe.com</a>
							</address>
						</div>
						<div class="col-sm-6">
							<h5>
								<strong>MY</strong> SKILLS
							</h5>
							<p>UI Design</p>
							<p>Clean and Modern Web Design</p>
							<p>PHP and MySQL Programming</p>
							<p>Vector Design</p>
						</div>
					</div>

				</div>
			</div>

			<div id="edit-profile" class="tab-pane animated fadeInRight">
				<div class="user-profile-content">
					<form role="form">
						<div class="form-group">
							<label for="FullName">Full Name</label> <input type="text"
								value="John Doe" id="FullName" class="form-control">
						</div>
						<div class="form-group">
							<label for="Email">Email</label> <input type="email"
								value="first.last@example.com" id="Email" class="form-control">
						</div>
						<div class="form-group">
							<label for="Username">Username</label> <input type="text"
								value="john" id="Username" class="form-control">
						</div>
						<div class="form-group">
							<label for="Password">Password</label> <input type="password"
								placeholder="6 - 15 Characters" id="Password"
								class="form-control">
						</div>
						<div class="form-group">
							<label for="RePassword">Re-Password</label> <input
								type="password" placeholder="6 - 15 Characters" id="RePassword"
								class="form-control">
						</div>
						<div class="form-group">
							<label for="AboutMe">About Me</label>
							<textarea style="height: 125px;" id="AboutMe"
								class="form-control">Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.</textarea>
						</div>
						<button class="btn btn-primary" type="submit">Save</button>
					</form>
				</div>
			</div>

			<div id="user-activities" class="tab-pane">
				<ul class="media-list">
					<li class="media"><a href="#">
							<p>
								<strong>John Doe</strong> Uploaded a photo <strong>"DSC000254.jpg"</strong>
								<br> <i>2 minutes ago</i>
							</p>
					</a></li>
					<li class="media"><a href="#">
							<p>
								<strong>Imran Tahir</strong> Created an photo album <strong>"Indonesia
									Tourism"</strong> <br> <i>8 minutes ago</i>
							</p>
					</a></li>
					<li class="media"><a href="#">
							<p>
								<strong>Colin Munro</strong> Posted an article <strong>"London
									never ending Asia"</strong> <br> <i>an hour ago</i>
							</p>
					</a></li>
					<li class="media"><a href="#">
							<p>
								<strong>Corey Anderson</strong> Added 3 products <br> <i>3
									hours ago</i>
							</p>
					</a></li>
					<li class="media"><a href="#">
							<p>
								<strong>Morne Morkel</strong> Send you a message <strong>"Lorem
									ipsum dolor..."</strong> <br> <i>12 hours ago</i>
							</p>
					</a></li>
					<li class="media"><a href="#">
							<p>
								<strong>Imran Tahir</strong> Updated his avatar <br> <i>Yesterday</i>
							</p>
					</a></li>
				</ul>
			</div>
			<div id="mymessage" class="tab-pane">
				<ul class="media-list">
					<li class="media"><a href="#" class="pull-left"> <img
							alt="Avatar" src="images/logo1.png" class="media-object">
					</a>
						<div class="media-body">
							<h4 class="media-heading">
								<a href="#fakelink">John Doe</a> <small>Just now</small>
							</h4>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
						</div></li>
					<li class="media"><a href="#" class="pull-left"> <img
							alt="Avatar" src="images/logo1.png" class="media-object">
					</a>
						<div class="media-body">
							<h4 class="media-heading">
								<a href="#fakelink">Tim Southee</a> <small>Yesterday at
									04:00 AM</small>
							</h4>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.
								Nam rhoncus</p>
						</div></li>
					<li class="media"><a href="#" class="pull-left"> <img
							alt="Avatar" src="images/logo1.png" class="media-object">
					</a>
						<div class="media-body">
							<h4 class="media-heading">
								<a href="#fakelink">Kane Williamson</a> <small>January
									17, 2014 05:35 PM</small>
							</h4>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
						</div></li>
					<li class="media"><a href="#" class="pull-left"> <img
							alt="Avatar" src="images/logo1.png" class="media-object">
					</a>
						<div class="media-body">
							<h4 class="media-heading">
								<a href="#fakelink">Lonwabo Tsotsobe</a> <small>January
									17, 2014 05:35 PM</small>
							</h4>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
						</div></li>
					<li class="media"><a href="#" class="pull-left"> <img
							alt="Avatar" src="images/logo1.png" class="media-object">
					</a>
						<div class="media-body">
							<h4 class="media-heading">
								<a href="#fakelink">Dale Steyn</a> <small>January 17,
									2014 05:35 PM</small>
							</h4>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
						</div></li>
					<li class="media"><a href="#" class="pull-left"> <img
							alt="Avatar" src="images/logo1.png" class="media-object">
					</a>
						<div class="media-body">
							<h4 class="media-heading">
								<a href="#fakelink">John Doe</a> <small>Just now</small>
							</h4>
							<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
						</div></li>
				</ul>
			</div>
		</div>
		<!--/tab-content-->
	</div>
	<!--/block-web-->
</div>
<!--/col-md-8-->
<!--</div>/row-->
