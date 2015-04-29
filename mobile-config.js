App.info({
  name: 'Brainfeed',
  description: 'Helps to organize your digital feeds. Built in Meteor',
  author: 'Wyrme Team',
  email: 'idris@wyrme.io',
  website: 'http://wyrme.io',
  version: '0.0.1'
});

App.icons({
  'android_xhdpi': 'resources/icons/icon.png'
});


App.setPreference('Fullscreen', 'true');
App.accessRule('*');

