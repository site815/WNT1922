// Native presentation state is supplied by the actual model loader, not inferred
// from ship type or ownership. Roster-only selections may have no visual status.
const messages = Object.freeze({
  'pending-art': '3D artwork pending. An amber ? navigation symbol marks this hull; no ship model is displayed.',
  'detailed-model': 'Detailed 3D model displayed.',
  'model-error': 'The 3D model could not load. A red ! navigation symbol marks this hull.',
  'navigation-symbol': 'Port scenery pending. A navigation symbol marks this port.',
});

export const NATIVE_ART_LEGEND = 'Amber ? diamonds mark ships with 3D artwork pending; red ! symbols mark model loading errors. Each hull remains individually selectable.';

export function nativeArtNotice(selection) {
  const status = selection?.visualStatus;
  if (!Object.hasOwn(messages, status)) return '';
  const message = status === 'model-error' && selection.detailedModel
    ? 'The edited 3D model could not load. Its last valid version remains displayed.'
    : messages[status];
  return `<p class="panel-note native-art-status" data-visual-status="${status}">${message}</p>`;
}
