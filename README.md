API: URL Shortener Microservice
================================

--------------------------
User stories:
--------------------------

- I can pass a URL as a parameter and I will receive a shortened URL in the JSON response.

- If I pass an invalid URL that doesn't follow the valid.

- When I visit that shortened URL, it will redirect me to my original link.


--------------------------
Example creation usage:
--------------------------

https://shorturl-hr.glitch.me/new/https://www.google.com

https://shorturl-hr.glitch.me/new/https://www.freecodecamp.org/challenges/url-shortener-microservice

https://shorturl-hr.glitch.me/new/www.mongodb.com

--------------------------
Example creation output:
--------------------------

{"original_url":"https://www.google.com", "short_url":"https://shorturl-hr.glitch.me/4bvowV7R"}

{"original_url":"https://www.freecodecamp.org/challenges/url-shortener-microservice", "short_url":"https://shorturl-hr.glitch.me/7IfLww9S"}

{"error":"Wrong url format, pass a valid protocol and site."}

--------------------------
Usage:
--------------------------

https://shorturl-hr.glitch.me/4bvowV7R

Will redirect to:

https://www.google.com

--------------------------

https://shorturl-hr.glitch.me/7IfLww9S

Will redirect to:

https://www.freecodecamp.org/challenges/url-shortener-microservice


--------------------------
Made by [hr](https://github.com/hrego/)