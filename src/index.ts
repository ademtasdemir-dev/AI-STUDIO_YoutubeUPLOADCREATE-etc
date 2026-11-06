import { DesktopHud } from './ui/DesktopHud';
import { SAMPLE_VIDEOS } from './constants';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app') || document.getElementById('root') || document.body;
  const initialData = SAMPLE_VIDEOS[0].data;

  new DesktopHud(appContainer, initialData);
});
