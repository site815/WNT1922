// Presentation provenance only: never substitute the referenced asset's ship
// specifications, inventory, identity or combat statistics into a campaign.
const identifier = value => typeof value === 'string' && /^[\w-]+$/.test(value);
export function assetReference(definition, scenario = {}, campaign = scenario.id || '', {drawing = false} = {}) {
  const id = (drawing ? definition?.recognitionModelId : null) || definition?.modelId || definition?.id;
  const source = (drawing ? definition?.recognitionCampaign : null) || definition?.modelCampaign || scenario.assetCampaign || campaign;
  if (!identifier(id) || (source && !identifier(source))) throw Error('Invalid explicit asset reference: ' + definition?.id);
  return {modelClassId:id, modelCampaign:source || '',
    representativeModel:drawing ? !!(definition?.representativeDrawing ?? definition?.representativeModel) : !!definition?.representativeModel};
}
export function campaignAssetReferences(content, campaign = content?.scenario?.id || '') {
  return Object.fromEntries(Object.values(content?.classes || {}).map(definition => [definition.id, assetReference(definition,content?.scenario,campaign)]));
}
export function referencedAsset(platforms, reference, kind = '') {
  const id = (kind ? kind + ':' : '') + reference.modelClassId;
  return platforms.get(reference.modelCampaign + ':' + id) || platforms.get(id);
}
