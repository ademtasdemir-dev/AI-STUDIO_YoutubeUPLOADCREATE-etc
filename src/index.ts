import * as xb from 'xrblocks';
import { SpatialStudio } from './scene/SpatialStudio';
import { DesktopHud } from './ui/DesktopHud';
import { SAMPLE_VIDEOS } from './constants';

document.addEventListener('DOMContentLoaded', async () => {
  const spatialStudio = new SpatialStudio();
  xb.add(spatialStudio);

  const options = new xb.Options();
  options.setAppTitle('YouTube Video Analyzer');
  options.setAppDescription(
    'KI-gestützte Struktur- und Inhaltsanalyse von YouTube-Videos in XR und Web-Studio.'
  );

  await xb.init(options);

  // Initialize 2D Desktop HUD
  const hudContainer = document.getElementById('hudContainer');
  const initialData = SAMPLE_VIDEOS[0].data;

  if (hudContainer) {
    new DesktopHud(hudContainer, initialData, (updatedData) => {
      spatialStudio.updateAnalysis(updatedData);
    });

    // Sync initial state into 3D scene
    spatialStudio.updateAnalysis(initialData);
  }

  // Restore HUD button
  const btnRestore = document.getElementById('btnRestoreHud');
  btnRestore?.addEventListener('click', () => {
    document.body.classList.remove('xr-immersive-view');
  });
});
