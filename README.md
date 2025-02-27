# EmbedIn

A simple and sleek frontend for VidSrc and similar services that provide embedded movies and TV shows. Easily search, browse, and watch content with a user-friendly interface.

## Framework

This app is built using the Expo React Native framework. 

## Prerequisites

- Node.js and npm installed
- Expo CLI installed (`npm install -g expo-cli`)
- `.env` file with the required TMDB API key

## Setup

1. Clone the repository:
   ```sh
   git clone https://github.com/jarvisnexus/embedin.git
   cd vidsrcstream
   ```
2. Create a `.env` file in the project root and set the TMDB API Key
   ```cmd
   EXPO_PUBLIC_TMDB_API_KEY=api_key_here
   ```
3. Install dependencies:
   ```cmd
   npm install
   ```
4. Start the Expo development server:
   ```cmd
   npx expo start
   ```
   
## Running on Expo Go

- Scan the QR code from the Expo CLI output using the Expo Go app on your mobile device.

## Stopping the Development Server

To stop the running process, press `Ctrl + C` in the terminal.

## Embed URL Templates

The embed URL templates can be modified in the Settings > Embed Settings page. Update them as needed to customize the embed URLs.

Use the following URL templates to embed movie and TV show content from any provider:

- **Movies:**
  ```sh
  https://vidsrc.cc/v2/embed/movie/{IMDBID}?poster=true&autoPlay=false
  ```

- **TV Shows:**
  ```sh
  https://vidsrc.cc/v2/embed/tv/{IMDBID}/{SEASON}/{EPISODE}?poster=true&autoPlay=false
  ```

Ensure that {IMDBID}, {SEASON}, and {EPISODE} are included in the TV show URL; otherwise, it will not work. The {SEASON} and {EPISODE} parameters are not required for the movie template.

## Docker support

This project is available as docker container. Use the below yaml script.

```yaml
version: '3.0'

name: EmbedIn
services:
  embedin:
    container_name: embedin
    hostname: embedin
    image: jarvisnexus/embedin:latest
    ports:
      - "4444:80"
    restart: unless-stopped
```

## Screenshots

<p align="center">
  <img src="https://i.postimg.cc/Wzm0hzxL/1.png" width="18%" />
  <img src="https://i.postimg.cc/7ZZSZxVd/2.png" width="18%" />
  <img src="https://i.postimg.cc/XY1dZT1J/3.png" width="18%" />
  <img src="https://i.postimg.cc/Yq31741Q/4.png" width="18%" />
</p>

<p align="center">
  <img src="https://i.postimg.cc/5jd1kNt0/1.png" width="18%" />
  <img src="https://i.postimg.cc/t4zZP8rP/2.png" width="18%" />
  <img src="https://i.postimg.cc/N0fjSGpr/3.png" width="18%" />
  <img src="https://i.postimg.cc/Kz1R6jmr/4.png" width="18%" />  
</p>



## LICENSE

Licensed under the GNU General Public License v3.0 (GPL-3.0).
