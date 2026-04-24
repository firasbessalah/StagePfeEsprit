import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,
  apiBaseUrl: 'http://localhost:8080',
  recaptchaSiteKey: '6Lf7r-EqAAAAAO4wc5S9o3ZhF5ronTLKiptJZFKp',
  googleClientId: '157705461336-rfp316ppj82jf6d6aonila5bbfm0sivj.apps.googleusercontent.com'
};
