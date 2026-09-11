"""Build game ownership overlays from public-domain Natural Earth only.
No earlier map or coordinates are read. Interwar corrections are coarse authored
game zones, not surveyed historical borders. Normal builds use committed JSON.
Install tools/map-requirements.txt only when regenerating these maps.
"""
import io, json, zipfile, hashlib
from pathlib import Path
import shapefile
from shapely.geometry import shape, mapping, Polygon, box
from shapely.ops import unary_union
from shapely import make_valid

source=Path('game/data/natural-earth-map-units.zip')
archive=zipfile.ZipFile(source)
prefix='ne_50m_admin_0_map_units'
reader=shapefile.Reader(**{k:io.BytesIO(archive.read(prefix+'.'+k)) for k in ('shp','shx','dbf')},encoding='utf-8')
units={}
for record in reader.iterShapeRecords():
    r=record.record.as_dict()
    units[r['GU_A3']]=(r,make_valid(shape(record.shape.__geo_interface__)))
owners={
 'USA':'USA GUM PHL PRI VIR ASM',
 'GBR':'GBR CAN AUS NZL IND PAK BGD MMR LKA MYS SGP BRN HKG MLT CYP CYN EGY SDN SDS ZAF NAM BWA LSO SWZ ZWE ZMB MWI KEN UGA TZA TZZ NGA GHA GMB SLE GUY BLZ JAM BHS BRB TTO GRD DMA LCA VCT KNA ATG AIA VGB BMU CYM TCA MSR SGS SHN FLK JEY GGY IMN PCN IOT FJI SLB PNG NRU KIR TUV TON WSM COK NIU TKL NFK CXR CCK IOA HMD ATC MDV MUS SYC ARE BHR QAT KWT',
 'FRA':'FRA SPM WLF MAF BLM PYF NCL ATF DZA MAR TUN SEN MRT MLI NER BFA BEN CIV GIN GAB COG CAF TCD CMR TGO MDG COM DJI SYR LBN VNM KHM LAO',
 'ITA':'ITA LBY ERI SOM','JPN':'JPN KOR PRK TWN FSM MHL MNP PLW',
 'SOV':'RUS UKR BLR ARM GEO AZE KAZ UZB TKM TJK KGZ',
 'NLD':'NLD IDN SUR ABW CUW SXM','BEL':'BEL COD RWA BDI',
 'PRT':'PRT AGO MOZ GNB CPV STP TLS MAC','ESP':'ESP GNQ SAH',
 'DNK':'DNK GRL FRO ISL','CHN':'CHN','DEU':'DEU'
}
owner_by_code={code:owner for owner,codes in owners.items() for code in codes.split()}
# These are game keys used by fronts, ports and labels, not source-map records.
groups=[
 ('c2','United States','USA','USA'),('c200','United Kingdom','GBR','ENG WLS SCT NIR'),
 ('c220','France','FRA','FXX'),('c325','Italy','ITA','ITA'),('c740','Japan','JPN','JPN'),
 ('c900','Australia','GBR','AUS'),('c290','Poland','c290','POL'),
 ('c385','Norway','c385','NOR NJM NSV'),('c390','Denmark','DNK','DNK'),
 ('c210','Netherlands','NLD','NLD'),('c211','Belgium','BEL','BFR BWR BCR'),('c212','Luxembourg','c212','LUX'),
 ('c305','Austria','c305','AUT'),('c315','Czechoslovakia','c315','CZE SVK'),
 ('c345','Yugoslavia','c345','SVN HRV BHF BIS SRS SRV MNE MKD KOS'),('c350','Greece','c350','GRC'),
 ('c620','Libya','ITA','LBY'),('c651','Egypt','GBR','EGY'),('c616','Tunisia','FRA','TUN'),
 ('c840','Philippines','USA','PHL'),('c827','Singapore','GBR','SGP'),
 ('c850','Netherlands East Indies','NLD','IDN'),('c835','Brunei','GBR','BRN'),
 ('c940','Solomon Islands','GBR','SLB'),('c710','China','CHN','CHN')
]
def polygons(g):
    if g.geom_type in ('Polygon','MultiPolygon'):return g
    return unary_union([x for x in getattr(g,'geoms',[]) if x.geom_type in ('Polygon','MultiPolygon')])
def rounded(v):
    if isinstance(v,dict):return {k:rounded(x) for k,x in v.items()}
    if isinstance(v,(list,tuple)):return [rounded(x) for x in v]
    return round(v,3) if isinstance(v,float) else v
def generate(year):
    used=set();regions={}
    def combine(codes):
        keys=codes.split();used.update(keys)
        return unary_union([units[k][1] for k in keys if k in units])
    def add(key,name,owner,g):
        g=polygons(make_valid(g))
        if not g.is_empty:regions[key]=(name,owner,g)
    for key,name,owner,codes in groups:add(key,name,owner,combine(codes))
    germany=combine('DEU');soviet=combine('RUS UKR BLR ARM GEG AZE KAZ UZB TKM TJK KGZ')
    # Original approximate interwar game zones; never traced from a restricted map.
    kaliningrad=units['RUS'][1].intersection(box(19,54,23,56));soviet=soviet.difference(kaliningrad)
    poland=regions['c290'][2]
    german_zone=Polygon([(12,49),(18,49),(17.7,50.1),(16.6,51.1),(16.2,52),(16.9,53),(16.2,54.5),(12,54.5),(12,49)])
    east_prussia=Polygon([(19,53.4),(20.2,53.4),(22.8,54.1),(23,56),(19,56),(19,53.4)])
    added=german_zone.union(east_prussia).intersection(poland)
    germany=germany.union(added).union(kaliningrad);poland=poland.difference(added)
    eastern_poland=Polygon([(22,48),(25,48),(26.2,49),(26.7,50),(26.6,51),(27.6,51.5),(27.4,52.5),(26.5,53.5),(27.8,54.5),(27.8,56),(22,56),(22,48)])
    eastern=units['BLR'][1].union(units['UKR'][1]).intersection(eastern_poland)
    soviet=soviet.difference(eastern);poland=poland.union(eastern)
    danzig=poland.intersection(box(18.35,54.12,18.95,54.45));poland=poland.difference(danzig)
    add('c290','Poland · approximate interwar boundary','c290',poland)
    add('c291','Free City of Danzig · approximate','c291',danzig)
    for suffix,bounds in [('w',(-180,-90,12.5,90)),('e',(12.5,-90,180,90))]:add('c255'+suffix,'Germany · '+('western' if suffix=='w' else 'eastern')+' campaign region','DEU',germany.intersection(box(*bounds)))
    for suffix,bounds in [('w',(-180,-90,42,90)),('e',(42,-90,180,90))]:add('c365'+suffix,'Soviet territories · '+('western' if suffix=='w' else 'eastern')+' campaign region','SOV',soviet.intersection(box(*bounds)))
    malaysia=combine('MYS')
    add('c821','Malaya','GBR',malaysia.intersection(box(-180,-90,107,90)))
    # Penang and Malacca stay within Malaya; Singapore has its own source polygon.
    add('c823','Sarawak · approximate','GBR',malaysia.intersection(box(107,-90,116,90)))
    add('c824','North Borneo · approximate','GBR',malaysia.intersection(box(116,-90,180,90)))
    papua=combine('PNX PNB')
    add('c911','Territory of New Guinea · approximate','GBR',papua.intersection(box(-180,-5.5,180,90)))
    add('c912','Territory of Papua · approximate','GBR',papua.intersection(box(-180,-90,180,-5.5)))
    if year>=1932:
        china=regions['c710'][2]
        zone=Polygon([(119,41),(123,39),(129,42),(135,48),(122,54),(116.5,48),(119,41)])
        add('manchuria','Manchuria · Japanese client state, approximate','JPN',china.intersection(zone))
        add('c710','China','CHN',china.difference(zone))
    for code,(r,g) in units.items():
        if code in used:continue
        owner=owner_by_code.get(r['ADM0_A3'],'ne_'+code)
        if code=='VUT':owner='GBR' # Shared Anglo-French condominium; one display color.
        if code=='SOL':owner='GBR'
        if code=='MDA':owner='ne_ROU' # Interwar Bessarabia; approximate current boundary.
        add('ne_'+code,r['GEOUNIT'],owner,g)
    features=[]
    for key,(name,owner,g) in sorted(regions.items()):
        g=polygons(g.simplify(.045,preserve_topology=True));p=g.representative_point()
        features.append({'id':key,'name':name,'owner':owner,'capital':'','point':[round(p.x,3),round(p.y,3)],'geometry':rounded(mapping(g))})
    return {'date':f'{year}-'+('02-06' if year==1922 else '01-01'),'source':'Natural Earth 1:50m map units 5.1.1 + authored historical game overlays','license':'Public domain','sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'historicalAccuracy':'Approximate game boundaries; modern base geometry grouped and clipped for the scenario.','features':features}
for year,name in [(1922,'world-political-1922.json'),(1936,'world-political.json')]:
    result=generate(year);out=Path('game/data')/name
    out.write_text(json.dumps(result,separators=(',',':')),encoding='utf-8')
    print(year,len(result['features']),'territories;',out.stat().st_size,'bytes')
