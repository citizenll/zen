import { createApp } from 'vue'
import App from './Options.vue'
import '../styles'
import { installI18n } from '~/logic/i18n'
const app = createApp(App)
installI18n(app);
app.mount('#app')
