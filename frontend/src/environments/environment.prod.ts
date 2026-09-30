import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiBaseUrl: 'https://pfe-backend-sdea.onrender.com',
  recaptchaSiteKey: '6Le-UHYrAAAAAFAfRnm1GxAqskMR0ZOlbr3GjrqL',
  googleClientId: '157705461336-rfp316ppj82jf6d6aonila5bbfm0sivj.apps.googleusercontent.com'
};
