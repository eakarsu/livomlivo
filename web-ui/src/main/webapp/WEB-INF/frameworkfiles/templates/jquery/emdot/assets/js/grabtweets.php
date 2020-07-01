<?

//We use already made Twitter OAuth library
//https://github.com/mynetx/codebird-php
require_once ('codebird.php');

//Twitter OAuth Settings, enter your settings here:
$CONSUMER_KEY = 'osQRerDvj6uRZemkQM9hUA';
$CONSUMER_SECRET = 'UTKmsdx2nsQhfsCQbaUeYNvAMKI10sWOs5zrEBGus';
$ACCESS_TOKEN = '54201793-J6jy317RVubBNoUUDYefIoQh3x9gaLgmI7B7us6bY';
$ACCESS_TOKEN_SECRET = 'ixT7jbk4l7PR9GouzqeJfCxC969mHxffOZv8N5U';

//Get authenticated
Codebird::setConsumerKey($CONSUMER_KEY, $CONSUMER_SECRET);
$cb = Codebird::getInstance();
$cb->setToken($ACCESS_TOKEN, $ACCESS_TOKEN_SECRET);


//retrieve posts
$q = $_POST['q'];
$count = $_POST['count'];
$api = $_POST['api'];

//https://dev.twitter.com/docs/api/1.1/get/statuses/user_timeline
//https://dev.twitter.com/docs/api/1.1/get/search/tweets
$params = array(
	'screen_name' => $q,
	'q' => $q,
	'count' => $count
);

//Make the REST call
$data = (array) $cb->$api($params);

//Output result in JSON, getting it ready for jQuery to process
echo json_encode($data);

?>