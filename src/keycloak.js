import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8080',
  realm: 'twitter-clone',
  clientId: 'twitter-backend',
});

export default keycloak;