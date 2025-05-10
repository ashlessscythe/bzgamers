Note: We offer commercial partnership for users with a commercial need in their projects. For more details on that process please reach out to partner@igdb.com
Authentication
Now that you have a Client ID and Client Secret you will be authenticating as a Twitch Developer using Oauth2.
Detailed information can be found in the Twitch Developer Docs.

Make a POST request to https://id.twitch.tv/oauth2/token with the following query string parameters, substituting your Client ID and Client Secret accordingly.

client_id=Client ID

client_secret=Client Secret

grant_type=client_credentials

Example
If your Client ID is abcdefg12345 and your Client Secret is hijklmn67890, the whole url should look like the following.

POST: https://id.twitch.tv/oauth2/token?client_id=abcdefg12345&client_secret=hijklmn67890&grant_type=client_credentials
The response from this will be a json object containing the access token and the number of second until the token expires.

{
  "access_token": "access12345token",
  "expires_in": 5587808,
  "token_type": "bearer"
}
Note: The expires_in shows you the number of seconds before the access_token will expire and must be refreshed.
Requests
Most of the requests to the API will use the POST method
The base URL is: https://api.igdb.com/v4
You define which endpoint you wish to query by appending /{endpoint name} to the base URL eg. https://api.igdb.com/v4/games
Include your Client ID and Access Token in the HEADER of your request so that your headers look like the following.
Take special care of the capitalisation. Bearer should be hard-coded infront of your access_token
Client-ID: Client ID
Authorization: Bearer access_token
You use the BODY of your request to specify the fields you want to retrieve as well as any other filters, sorting etc
Example
If your Client ID is abcdefg12345 and your access_token is access12345token, a simple request to get information about 10 games would be.

POST: https://api.igdb.com/v4/games
Client-ID: abcdefg12345
Authorization: Bearer access12345token
Body: "fields *;"
Note: If you are trying to make these requests via the Browser you will run into CORS errors as the API does not allow requests directly from browsers. You can read more about CORS and how to go around this issue in the CORS Proxy section
More Examples
You can find some examples requests here

Rate Limits
There is a rate limit of 4 requests per second. If you go over this limit you will receive a response with status code 429 Too Many Requests.

You are able to have up to 8 open requests at any moment in time. This can occur if requests take longer than 1 second to respond when multiple requests are being made.

Wrappers
Get setup quickly by using one of these wrappers!

Apicalypse
NodeJS
JVM/Kotlin/Java
Swift
Python
Third Party
PHP/Laravel
GO
Ruby
C#/.NET
Deno
Third Party Documentation
OpenAPI Documentation
Postman Collection
Examples
It’s recommended to try out your queries in an API viewer like Postman or Insomnia before using code. This helps you find problems a lot sooner!

Postman setup example





A very basic example to retrieve the name for 10 games.
https://api.igdb.com/v4/games/

fields name; limit 10;
Get all information from a specific game
1942, is the ID of a game.

https://api.igdb.com/v4/games/

fields *; where id = 1942;
Exclude irrelevant data from your query
Remove alternative_name from your result query

https://api.igdb.com/v4/platforms/

fields *;
exclude alternative_name;
Get all games from specific genres
Notice how you can comma separate multiple IDs (8, 9, and 11). You can do this with games, companies and anything else. Also note that when you have multiple IDs they have to be surrounded by a parenthesis. Single ids can be queried both with and without the parenthesis.

https://api.igdb.com/v4/genres/

fields *; where id = (8,9,11);
Count total games that have a rating higher than 75
https://api.igdb.com/v4/games/count

where rating > 75;
Order by rating
https://api.igdb.com/v4/games/

fields name,rating; sort rating desc;
Coming soon games for Playstation 4
https://api.igdb.com/v4/release_dates/

fields *; where game.platforms = 48 & date > 1538129354; sort date asc;
1538129354: Is the timestamp in milliseconds of 28/09/2018 (This you need to generate yourself) 48 Is the platform id of Playstation 4.

Recently released games for Playstation 4
fields *; where game.platforms = 48 & date < 1538129354; sort date desc;
Note: "where game.platforms = 48 & date > 1538129354" It is possible to use either & (AND) or | (OR) to combine filters to better define the behaviour of your query
Search, return certain fields.
https://api.igdb.com/v4/games/

search "Halo"; fields name,release_date.human;
https://api.igdb.com/v4/games/

fields name, involved_companies; search "Halo";
Search games but exclude versions (editions)
https://api.igdb.com/v4/games/

fields name, involved_companies; search "Assassins Creed"; where version_parent = null;
This will return search results with ID and name of the game but exclude editions such as “Collectors Edition”.

Searching all endpoints
Note: Search is now also it's own endpoint. Search is usable on: Characters, Collections, Games, Platforms, and Themes
The example below searches for “Sonic the Hedgehog” which will find the Character Sonic, the collection Soninc the Hedgehog. And of course also several games with names containing Sonic the Hedgehog.

https://api.igdb.com/v4/search

fields *; search "sonic the hedgehog"; limit 50;
Get versions (editions) of a game
https://api.igdb.com/v4/game_versions/

fields game.name,games.name; where game = 28540;
The resulting object will contain all games that are a version of the game with id 28540

Get the parent game for a version
https://api.igdb.com/v4/games/

fields version_parent.*; where id = 39047;
The resulting object will contain all main games

Get all games that are playstation 4 exclusives
fields name,category,platforms;
where category = 0 & platforms = 48;
Get all games that are only released on playstation 4 AND PC
fields name,category,platforms;
where category = 0 & platforms = {48,6};