

public with sharing class AAATestData {
    public AAATestData() {

    }


// In Execute Anonymous run
// AAATestData.testScripts(1);
// for each of 1 to 9

public static void testScripts(Integer sectionNumber) {

Account a;
Account p;
Opportunity o;

if (sectionNumber == 1) { 
a=new Account(Name='Burke Enterprises', AnnualRevenue=39281800); insert a;
}

if (sectionNumber == 2) { 
p=[select id from Account where Name='Burke Enterprises'];
a=new Account(Name='3i', AnnualRevenue=39177921);a.parentid=p.id;insert a;
a=new Account(Name='3G Capital', AnnualRevenue=39074042);a.parentid=p.id;insert a;
a=new Account(Name='ABS Capital', AnnualRevenue=38970163);a.parentid=p.id;insert a;
a=new Account(Name='ABRY Partners', AnnualRevenue=38866284);a.parentid=p.id;insert a;
a=new Account(Name='Accel-KKR', AnnualRevenue=38762405);a.parentid=p.id;insert a;
a=new Account(Name='Actera Group', AnnualRevenue=38658526);a.parentid=p.id;insert a;
a=new Account(Name='Actis', AnnualRevenue=38554647);a.parentid=p.id;insert a;
a=new Account(Name='Advent International', AnnualRevenue=38450768);a.parentid=p.id;insert a;
a=new Account(Name='AEA Investors', AnnualRevenue=38346889);a.parentid=p.id;insert a;
}

if (sectionNumber == 3) { 
p=[select id from Account where Name='3G Capital' ];a=new Account(Name='AlpInvest Partners', AnnualRevenue=38139131);a.parentid=p.id;insert a;
a=new Account(Name='Arlington Capital Partners', AnnualRevenue=37204220);a.parentid=p.id;insert a;
a=new Account(Name='Berkshire Partners', AnnualRevenue=36269309);a.parentid=p.id;insert a;
a=new Account(Name='Brynwood Partners', AnnualRevenue=35334398);a.parentid=p.id;insert a;
a=new Account(Name='Carlyle Group', AnnualRevenue=34607245);a.parentid=p.id;insert a;
a=new Account(Name='Charterhouse Capital Partners', AnnualRevenue=33880092);a.parentid=p.id;insert a;
a=new Account(Name='Clarity Partners', AnnualRevenue=33152939);a.parentid=p.id;insert a;
a=new Account(Name='Coller Capital', AnnualRevenue=32841302);a.parentid=p.id;insert a;
a=new Account(Name='Court Square Capital Partners', AnnualRevenue=32529665);a.parentid=p.id;insert a;
p=[select id from Account where Name='3i' ];a=new Account(Name='Affinity Equity Partners', AnnualRevenue=38243010);a.parentid=p.id;insert a;
a=new Account(Name='Ares Management', AnnualRevenue=37308099);a.parentid=p.id;insert a;
a=new Account(Name='BDT Capital Partners', AnnualRevenue=36373188);a.parentid=p.id;insert a;
a=new Account(Name='Bruckmann, Rosser, Sherrill & Co.', AnnualRevenue=35438277);a.parentid=p.id;insert a;
a=new Account(Name='Capvis', AnnualRevenue=34711124);a.parentid=p.id;insert a;
a=new Account(Name='Charlesbank Capital Partners', AnnualRevenue=33983971);a.parentid=p.id;insert a;
a=new Account(Name='CIVC Partners', AnnualRevenue=33256818);a.parentid=p.id;insert a;
a=new Account(Name='Close Brothers Group', AnnualRevenue=32945181);a.parentid=p.id;insert a;
a=new Account(Name='Conquest Asset Management', AnnualRevenue=32633544);a.parentid=p.id;insert a;
p=[select id from Account where Name='ABRY Partners' ];a=new Account(Name='American Securities', AnnualRevenue=37931373);a.parentid=p.id;insert a;
a=new Account(Name='Auldbrass Partners', AnnualRevenue=36996462);a.parentid=p.id;insert a;
a=new Account(Name='Blackstone Group', AnnualRevenue=36061551);a.parentid=p.id;insert a;
a=new Account(Name='Butler Capital Partners', AnnualRevenue=35126640);a.parentid=p.id;insert a;
a=new Account(Name='Catterton Partners', AnnualRevenue=34399487);a.parentid=p.id;insert a;
a=new Account(Name='Chicago Growth Partners', AnnualRevenue=33672334);a.parentid=p.id;insert a;
p=[select id from Account where Name='ABS Capital' ];a=new Account(Name='Altor Equity Partners', AnnualRevenue=38035252);a.parentid=p.id;insert a;
a=new Account(Name='Audax Group', AnnualRevenue=37100341);a.parentid=p.id;insert a;
a=new Account(Name='BIP Investment Partners', AnnualRevenue=36165430);a.parentid=p.id;insert a;
a=new Account(Name='Brysam Global Partners', AnnualRevenue=35230519);a.parentid=p.id;insert a;
a=new Account(Name='Castle Harlan', AnnualRevenue=34503366);a.parentid=p.id;insert a;
a=new Account(Name='Charterhouse Group', AnnualRevenue=33776213);a.parentid=p.id;insert a;
a=new Account(Name='Clayton, Dubilier & Rice', AnnualRevenue=33049060);a.parentid=p.id;insert a;
a=new Account(Name='Colony Capital', AnnualRevenue=32737423);a.parentid=p.id;insert a;
a=new Account(Name='Crestview Partners', AnnualRevenue=32425786);a.parentid=p.id;insert a;
p=[select id from Account where Name='Accel-KKR' ];a=new Account(Name='Angelo, Gordon & Co.', AnnualRevenue=37827494);a.parentid=p.id;insert a;
a=new Account(Name='Avenue Capital Group', AnnualRevenue=36892583);a.parentid=p.id;insert a;
a=new Account(Name='Blum Capital', AnnualRevenue=35957672);a.parentid=p.id;insert a;
a=new Account(Name='Campeau Corporation', AnnualRevenue=35022761);a.parentid=p.id;insert a;
a=new Account(Name='CCMP Capital', AnnualRevenue=34295608);a.parentid=p.id;insert a;
a=new Account(Name='China-Africa Development Fund', AnnualRevenue=33568455);a.parentid=p.id;insert a;
p=[select id from Account where Name='Actera Group' ];a=new Account(Name='Apax Partners', AnnualRevenue=37723615);a.parentid=p.id;insert a;
a=new Account(Name='Avista Capital Partners', AnnualRevenue=36788704);a.parentid=p.id;insert a;
a=new Account(Name='Brentwood Associates', AnnualRevenue=35853793);a.parentid=p.id;insert a;
a=new Account(Name='Candover Investments', AnnualRevenue=34918882);a.parentid=p.id;insert a;
a=new Account(Name='Centerbridge Partners', AnnualRevenue=34191729);a.parentid=p.id;insert a;
a=new Account(Name='CI Capital Partners', AnnualRevenue=33464576);a.parentid=p.id;insert a;
p=[select id from Account where Name='Actis' ];a=new Account(Name='Apollo Management', AnnualRevenue=37619736);a.parentid=p.id;insert a;
a=new Account(Name='Bain Capital', AnnualRevenue=36684825);a.parentid=p.id;insert a;
a=new Account(Name='Bridgepoint Capital', AnnualRevenue=35749914);a.parentid=p.id;insert a;
a=new Account(Name='CapMan', AnnualRevenue=34815003);a.parentid=p.id;insert a;
a=new Account(Name='Cerberus Capital Management', AnnualRevenue=34087850);a.parentid=p.id;insert a;
a=new Account(Name='Cinven', AnnualRevenue=33360697);a.parentid=p.id;insert a;
p=[select id from Account where Name='Advent International' ];a=new Account(Name='Arcapita', AnnualRevenue=37515857);a.parentid=p.id;insert a;
a=new Account(Name='Baring Vostok Capital Partners', AnnualRevenue=36580946);a.parentid=p.id;insert a;
a=new Account(Name='Brockway Moran & Partners', AnnualRevenue=35646035);a.parentid=p.id;insert a;
p=[select id from Account where Name='AEA Investors' ];a=new Account(Name='Ardian (formerly AXA Private Equity)', AnnualRevenue=37411978);a.parentid=p.id;insert a;
a=new Account(Name='BC Partners', AnnualRevenue=36477067);a.parentid=p.id;insert a;
a=new Account(Name='Brookfield Asset Management', AnnualRevenue=35542156);a.parentid=p.id;insert a;
}

if (sectionNumber == 4) { 
p=[select id from Account where Name='Affinity Equity Partners' ];a=new Account(Name='CrossHarbor Capital Partners', AnnualRevenue=32321907);a.parentid=p.id;insert a;
a=new Account(Name='Investcorp', AnnualRevenue=26400804);a.parentid=p.id;insert a;
p=[select id from Account where Name='AlpInvest Partners' ];a=new Account(Name='Crossroads Group', AnnualRevenue=32218028);a.parentid=p.id;insert a;
a=new Account(Name='Irving Place Capital', AnnualRevenue=26296925);a.parentid=p.id;insert a;
p=[select id from Account where Name='Altor Equity Partners' ];a=new Account(Name='CVC Capital Partners', AnnualRevenue=32114149);a.parentid=p.id;insert a;
a=new Account(Name='J.H. Whitney & Company', AnnualRevenue=26193046);a.parentid=p.id;insert a;
p=[select id from Account where Name='American Securities' ];a=new Account(Name='Cypress Group', AnnualRevenue=32010270);a.parentid=p.id;insert a;
a=new Account(Name='J.W. Childs Associates', AnnualRevenue=26089167);a.parentid=p.id;insert a;
p=[select id from Account where Name='Angelo, Gordon & Co.' ];a=new Account(Name='Defoe Fournier & Cie.', AnnualRevenue=31906391);a.parentid=p.id;insert a;
a=new Account(Name='Jadwa Investment', AnnualRevenue=25985288);a.parentid=p.id;insert a;
p=[select id from Account where Name='Apax Partners' ];a=new Account(Name='Diamond Castle Holdings', AnnualRevenue=31802512);a.parentid=p.id;insert a;
a=new Account(Name='JC Flowers', AnnualRevenue=25881409);a.parentid=p.id;insert a;
p=[select id from Account where Name='Apollo Management' ];a=new Account(Name='Digital Sky Technologies', AnnualRevenue=31698633);a.parentid=p.id;insert a;
a=new Account(Name='JLL Partners', AnnualRevenue=25777530);a.parentid=p.id;insert a;
p=[select id from Account where Name='Arcapita' ];a=new Account(Name='DLJ Merchant Banking Partners', AnnualRevenue=31594754);a.parentid=p.id;insert a;
a=new Account(Name='JMI Equity', AnnualRevenue=25673651);a.parentid=p.id;insert a;
p=[select id from Account where Name='Ardian (formerly AXA Private Equity)' ];a=new Account(Name='Doughty Hanson & Co', AnnualRevenue=31490875);a.parentid=p.id;insert a;
a=new Account(Name='Jordan Company', AnnualRevenue=25569772);a.parentid=p.id;insert a;
p=[select id from Account where Name='Ares Management' ];a=new Account(Name='Dubai Dubai International Capital', AnnualRevenue=31386996);a.parentid=p.id;insert a;
a=new Account(Name='Kelso & Company', AnnualRevenue=25465893);a.parentid=p.id;insert a;
p=[select id from Account where Name='Arlington Capital Partners' ];a=new Account(Name='Duke Street Capital', AnnualRevenue=31283117);a.parentid=p.id;insert a;
a=new Account(Name='Kennet Partners', AnnualRevenue=25362014);a.parentid=p.id;insert a;
}

if (sectionNumber == 5) { 
p=[select id from Account where Name='Audax Group' ];a=new Account(Name='Electra Private Equity', AnnualRevenue=31179238);a.parentid=p.id;insert a;
a=new Account(Name='Khosla Ventures', AnnualRevenue=25258135);a.parentid=p.id;insert a;
p=[select id from Account where Name='Auldbrass Partners' ];a=new Account(Name='Elevation Partners', AnnualRevenue=31075359);a.parentid=p.id;insert a;
a=new Account(Name='Kinderhook Industries', AnnualRevenue=25154256);a.parentid=p.id;insert a;
p=[select id from Account where Name='Avenue Capital Group' ];a=new Account(Name='EnerVest[3]', AnnualRevenue=30971480);a.parentid=p.id;insert a;
a=new Account(Name='Kleiner Perkins Caufield & Byers', AnnualRevenue=25050377);a.parentid=p.id;insert a;
a=new Account(Name='MidOcean Partners', AnnualRevenue=22453402);a.parentid=p.id;insert a;
p=[select id from Account where Name='Avista Capital Partners' ];a=new Account(Name='EQT Partners', AnnualRevenue=30867601);a.parentid=p.id;insert a;
a=new Account(Name='Kohlberg & Company', AnnualRevenue=24946498);a.parentid=p.id;insert a;
a=new Account(Name='Morgan Stanley Private Equity', AnnualRevenue=22349523);a.parentid=p.id;insert a;
p=[select id from Account where Name='Bain Capital' ];a=new Account(Name='Eurazeo', AnnualRevenue=30763722);a.parentid=p.id;insert a;
a=new Account(Name='Kohlberg Kravis Roberts', AnnualRevenue=24842619);a.parentid=p.id;insert a;
a=new Account(Name='Morgenthaler', AnnualRevenue=22245644);a.parentid=p.id;insert a;
p=[select id from Account where Name='Baring Vostok Capital Partners' ];a=new Account(Name='Fenway Partners', AnnualRevenue=30659843);a.parentid=p.id;insert a;
a=new Account(Name='KRG Capital', AnnualRevenue=24738740);a.parentid=p.id;insert a;
a=new Account(Name='New Mountain Capital', AnnualRevenue=22141765);a.parentid=p.id;insert a;
p=[select id from Account where Name='BC Partners' ];a=new Account(Name='Ferd', AnnualRevenue=30555964);a.parentid=p.id;insert a;
a=new Account(Name='Lake Capital', AnnualRevenue=24634861);a.parentid=p.id;insert a;
a=new Account(Name='Newbridge Capital', AnnualRevenue=22037886);a.parentid=p.id;insert a;
p=[select id from Account where Name='BDT Capital Partners' ];a=new Account(Name='First Reserve Corporation', AnnualRevenue=30452085);a.parentid=p.id;insert a;
a=new Account(Name='Landmark Partners', AnnualRevenue=24530982);a.parentid=p.id;insert a;
a=new Account(Name='Nordic Capital', AnnualRevenue=21934007);a.parentid=p.id;insert a;
p=[select id from Account where Name='Berkshire Partners' ];a=new Account(Name='Forstmann Little & Company', AnnualRevenue=30348206);a.parentid=p.id;insert a;
a=new Account(Name='Lee Equity Partners', AnnualRevenue=24427103);a.parentid=p.id;insert a;
a=new Account(Name='NRDC Equity Partners', AnnualRevenue=21830128);a.parentid=p.id;insert a;
p=[select id from Account where Name='BIP Investment Partners' ];a=new Account(Name='Fortress Investment Group', AnnualRevenue=30244327);a.parentid=p.id;insert a;
p=[select id from Account where Name='BIP Investment Partners' ];a=new Account(Name='Leeds Equity Partners', AnnualRevenue=24323224);a.parentid=p.id;insert a;
p=[select id from Account where Name='Blackstone Group' ];a=new Account(Name='Founders Circle Capital', AnnualRevenue=30140448);a.parentid=p.id;insert a;
p=[select id from Account where Name='Blackstone Group' ];a=new Account(Name='Leonard Green & Partners', AnnualRevenue=24219345);a.parentid=p.id;insert a;
p=[select id from Account where Name='Blum Capital' ];a=new Account(Name='Fox Paine & Company', AnnualRevenue=30036569);a.parentid=p.id;insert a;
p=[select id from Account where Name='Blum Capital' ];a=new Account(Name='Leopard Capital LP', AnnualRevenue=24115466);a.parentid=p.id;insert a;
p=[select id from Account where Name='Brentwood Associates' ];a=new Account(Name='Francisco Partners', AnnualRevenue=29932690);a.parentid=p.id;insert a;
p=[select id from Account where Name='Brentwood Associates' ];a=new Account(Name='Lexington Partners', AnnualRevenue=24011587);a.parentid=p.id;insert a;
p=[select id from Account where Name='Bridgepoint Capital' ];a=new Account(Name='Freeman Spogli & Co.', AnnualRevenue=29828811);a.parentid=p.id;insert a;
p=[select id from Account where Name='Bridgepoint Capital' ];a=new Account(Name='Liechtenstein LGT Capital Partners', AnnualRevenue=23907708);a.parentid=p.id;insert a;
p=[select id from Account where Name='Brockway Moran & Partners' ];a=new Account(Name='Fremont Group', AnnualRevenue=29724932);a.parentid=p.id;insert a;
p=[select id from Account where Name='Brockway Moran & Partners' ];a=new Account(Name='Lightyear Capital', AnnualRevenue=23803829);a.parentid=p.id;insert a;
p=[select id from Account where Name='Brookfield Asset Management' ];a=new Account(Name='Friedman Fleischer & Lowe', AnnualRevenue=29621053);a.parentid=p.id;insert a;
p=[select id from Account where Name='Brookfield Asset Management' ];a=new Account(Name='Lincolnshire Management', AnnualRevenue=23699950);a.parentid=p.id;insert a;
p=[select id from Account where Name='Bruckmann, Rosser, Sherrill & Co.' ];a=new Account(Name='Frontenac Company', AnnualRevenue=29517174);a.parentid=p.id;insert a;
p=[select id from Account where Name='Bruckmann, Rosser, Sherrill & Co.' ];a=new Account(Name='Lindsay Goldberg Bessemer', AnnualRevenue=23596071);a.parentid=p.id;insert a;
}

if (sectionNumber == 6) { 
p=[select id from Account where Name='Brynwood Partners' ];a=new Account(Name='General Atlantic', AnnualRevenue=29413295);a.parentid=p.id;insert a;
p=[select id from Account where Name='Brynwood Partners' ];a=new Account(Name='Littlejohn & Co.', AnnualRevenue=23492192);a.parentid=p.id;insert a;
p=[select id from Account where Name='Brysam Global Partners' ];a=new Account(Name='Genstar Capital', AnnualRevenue=29309416);a.parentid=p.id;insert a;
p=[select id from Account where Name='Brysam Global Partners' ];a=new Account(Name='Livingbridge', AnnualRevenue=23388313);a.parentid=p.id;insert a;
p=[select id from Account where Name='Butler Capital Partners' ];a=new Account(Name='GFH Capital', AnnualRevenue=29205537);a.parentid=p.id;insert a;
p=[select id from Account where Name='Butler Capital Partners' ];a=new Account(Name='Lone Star Funds', AnnualRevenue=23284434);a.parentid=p.id;insert a;
p=[select id from Account where Name='Campeau Corporation' ];a=new Account(Name='GI Partners', AnnualRevenue=29101658);a.parentid=p.id;insert a;
p=[select id from Account where Name='Campeau Corporation' ];a=new Account(Name='LRG Capital Funds', AnnualRevenue=23180555);a.parentid=p.id;insert a;
p=[select id from Account where Name='Candover Investments' ];a=new Account(Name='GIMV', AnnualRevenue=28997779);a.parentid=p.id;insert a;
p=[select id from Account where Name='Candover Investments' ];a=new Account(Name='Lux Capital', AnnualRevenue=23076676);a.parentid=p.id;insert a;
p=[select id from Account where Name='CapMan' ];a=new Account(Name='Golden Gate Capital Partners', AnnualRevenue=28893900);a.parentid=p.id;insert a;
p=[select id from Account where Name='CapMan' ];a=new Account(Name='Madison Dearborn Partners', AnnualRevenue=22972797);a.parentid=p.id;insert a;
p=[select id from Account where Name='Capvis' ];a=new Account(Name='Goldman Sachs Capital Partners', AnnualRevenue=28790021);a.parentid=p.id;insert a;
p=[select id from Account where Name='Capvis' ];a=new Account(Name='MatlinPatterson Global Advisors', AnnualRevenue=22868918);a.parentid=p.id;insert a;
p=[select id from Account where Name='Carlyle Group' ];a=new Account(Name='Gores Group', AnnualRevenue=28686142);a.parentid=p.id;insert a;
p=[select id from Account where Name='Carlyle Group' ];a=new Account(Name='Mekong Capital', AnnualRevenue=22765039);a.parentid=p.id;insert a;
p=[select id from Account where Name='Castle Harlan' ];a=new Account(Name='GP Investimentos', AnnualRevenue=28582263);a.parentid=p.id;insert a;
p=[select id from Account where Name='Castle Harlan' ];a=new Account(Name='Metalmark Capital', AnnualRevenue=22661160);a.parentid=p.id;insert a;
p=[select id from Account where Name='Catterton Partners' ];a=new Account(Name='Graphite Capital', AnnualRevenue=28478384);a.parentid=p.id;insert a;
p=[select id from Account where Name='Catterton Partners' ];a=new Account(Name='Hungary Mid Europa Partners', AnnualRevenue=22557281);a.parentid=p.id;insert a;
p=[select id from Account where Name='CCMP Capital' ];a=new Account(Name='GTCR', AnnualRevenue=28374505);a.parentid=p.id;insert a;
p=[select id from Account where Name='Centerbridge Partners' ];a=new Account(Name='H&Q Asia Pacific', AnnualRevenue=28270626);a.parentid=p.id;insert a;
p=[select id from Account where Name='Cerberus Capital Management' ];a=new Account(Name='H.I.G. Capital', AnnualRevenue=28166747);a.parentid=p.id;insert a;
p=[select id from Account where Name='Charlesbank Capital Partners' ];a=new Account(Name='Harbert Management Corporation', AnnualRevenue=28062868);a.parentid=p.id;insert a;
p=[select id from Account where Name='Charterhouse Capital Partners' ];a=new Account(Name='HarbourVest Partners', AnnualRevenue=27958989);a.parentid=p.id;insert a;
p=[select id from Account where Name='Charterhouse Group' ];a=new Account(Name='Harvest Partners', AnnualRevenue=27855110);a.parentid=p.id;insert a;
p=[select id from Account where Name='Chicago Growth Partners' ];a=new Account(Name='HBG Holdings', AnnualRevenue=27751231);a.parentid=p.id;insert a;
p=[select id from Account where Name='China-Africa Development Fund' ];a=new Account(Name='Heartland Industrial Partners', AnnualRevenue=27647352);a.parentid=p.id;insert a;
p=[select id from Account where Name='CI Capital Partners' ];a=new Account(Name='Hellman & Friedman', AnnualRevenue=27543473);a.parentid=p.id;insert a;
p=[select id from Account where Name='Cinven' ];a=new Account(Name='HgCapital', AnnualRevenue=27439594);a.parentid=p.id;insert a;
p=[select id from Account where Name='CIVC Partners' ];a=new Account(Name='Highbridge Capital Management', AnnualRevenue=27335715);a.parentid=p.id;insert a;
p=[select id from Account where Name='Clarity Partners' ];a=new Account(Name='Highland Capital Management', AnnualRevenue=27231836);a.parentid=p.id;insert a;
p=[select id from Account where Name='Clayton, Dubilier & Rice' ];a=new Account(Name='Hillhouse Capital Group', AnnualRevenue=27127957);a.parentid=p.id;insert a;
p=[select id from Account where Name='Close Brothers Group' ];a=new Account(Name='HM Capital Partners', AnnualRevenue=27024078);a.parentid=p.id;insert a;
p=[select id from Account where Name='Coller Capital' ];a=new Account(Name='Hony Capital', AnnualRevenue=26920199);a.parentid=p.id;insert a;
p=[select id from Account where Name='Colony Capital' ];a=new Account(Name='IK Investment Partners', AnnualRevenue=26816320);a.parentid=p.id;insert a;
p=[select id from Account where Name='Conquest Asset Management' ];a=new Account(Name='InFrontier Ltd [4]', AnnualRevenue=26712441);a.parentid=p.id;insert a;
p=[select id from Account where Name='Court Square Capital Partners' ];a=new Account(Name='InterMedia Partners', AnnualRevenue=26608562);a.parentid=p.id;insert a;
p=[select id from Account where Name='Crestview Partners' ];a=new Account(Name='Intermediate Capital Group', AnnualRevenue=26504683);a.parentid=p.id;insert a;


}

if (sectionNumber == 7) {
p=[select id from Account where Name='BIP Investment Partners' ];a=new Account(Name='Oak Hill Capital Partners', AnnualRevenue=21726249);a.parentid=p.id;insert a;
p=[select id from Account where Name='Blackstone Group' ];a=new Account(Name='Oak Investment Partners', AnnualRevenue=21622370);a.parentid=p.id;insert a;
p=[select id from Account where Name='Blum Capital' ];a=new Account(Name='Oaktree Capital Management', AnnualRevenue=21518491);a.parentid=p.id;insert a;
p=[select id from Account where Name='Brentwood Associates' ];a=new Account(Name='Ocean Avenue Capital Partners', AnnualRevenue=21414612);a.parentid=p.id;insert a;
p=[select id from Account where Name='Bridgepoint Capital' ];a=new Account(Name='Olympus Partners', AnnualRevenue=21310733);a.parentid=p.id;insert a;
p=[select id from Account where Name='Brockway Moran & Partners' ];a=new Account(Name='OMERS', AnnualRevenue=21206854);a.parentid=p.id;insert a;
p=[select id from Account where Name='Brookfield Asset Management' ];a=new Account(Name='One Equity Partners', AnnualRevenue=21102975);a.parentid=p.id;insert a;
p=[select id from Account where Name='Bruckmann, Rosser, Sherrill & Co.' ];a=new Account(Name='Onex Corporation', AnnualRevenue=20999096);a.parentid=p.id;insert a;
p=[select id from Account where Name='Brynwood Partners' ];a=new Account(Name='OpCapita', AnnualRevenue=20895217);a.parentid=p.id;insert a;
p=[select id from Account where Name='Brysam Global Partners' ];a=new Account(Name='PAAMCO', AnnualRevenue=20791338);a.parentid=p.id;insert a;
p=[select id from Account where Name='Butler Capital Partners' ];a=new Account(Name='Pacific Equity Partners', AnnualRevenue=20687459);a.parentid=p.id;insert a;
p=[select id from Account where Name='Campeau Corporation' ];a=new Account(Name='PAI Partners', AnnualRevenue=20583580);a.parentid=p.id;insert a;
p=[select id from Account where Name='Candover Investments' ];a=new Account(Name='Pamlico Capital', AnnualRevenue=20479701);a.parentid=p.id;insert a;
p=[select id from Account where Name='CapMan' ];a=new Account(Name='Pantheon Ventures', AnnualRevenue=20375822);a.parentid=p.id;insert a;
p=[select id from Account where Name='Capvis' ];a=new Account(Name='Partners Group', AnnualRevenue=20271943);a.parentid=p.id;insert a;
p=[select id from Account where Name='Carlyle Group' ];a=new Account(Name='Permira', AnnualRevenue=20168064);a.parentid=p.id;insert a;
p=[select id from Account where Name='Castle Harlan' ];a=new Account(Name='Phoenix Equity Partners', AnnualRevenue=20064185);a.parentid=p.id;insert a;
p=[select id from Account where Name='Catterton Partners' ];a=new Account(Name='Platinum Equity', AnnualRevenue=19960306);a.parentid=p.id;insert a;
p=[select id from Account where Name='OpCapita' ];a=new Account(Name='Primus Capital', AnnualRevenue=19856427);a.parentid=p.id;insert a;
p=[select id from Account where Name='PAAMCO' ];a=new Account(Name='Prospect Partners', AnnualRevenue=19752548);a.parentid=p.id;insert a;
p=[select id from Account where Name='Pacific Equity Partners' ];a=new Account(Name='Providence Equity Partners', AnnualRevenue=19648669);a.parentid=p.id;insert a;
p=[select id from Account where Name='PAI Partners' ];a=new Account(Name='Quadrangle Group', AnnualRevenue=19544790);a.parentid=p.id;insert a;
p=[select id from Account where Name='Pamlico Capital' ];a=new Account(Name='Quadrant Private Equity', AnnualRevenue=19440911);a.parentid=p.id;insert a;
p=[select id from Account where Name='Pantheon Ventures' ];a=new Account(Name='Redpoint Ventures', AnnualRevenue=19337032);a.parentid=p.id;insert a;
p=[select id from Account where Name='Partners Group' ];a=new Account(Name='Rhône Group', AnnualRevenue=19233153);a.parentid=p.id;insert a;
p=[select id from Account where Name='Permira' ];a=new Account(Name='Riordan, Lewis & Haden', AnnualRevenue=19129274);a.parentid=p.id;insert a;
p=[select id from Account where Name='Phoenix Equity Partners' ];a=new Account(Name='Ripplewood Holdings', AnnualRevenue=19025395);a.parentid=p.id;insert a;
p=[select id from Account where Name='Platinum Equity' ];a=new Account(Name='Riverside Company', AnnualRevenue=18921516);a.parentid=p.id;insert a;
p=[select id from Account where Name='OpCapita' ];a=new Account(Name='Riverside Partners', AnnualRevenue=18817637);a.parentid=p.id;insert a;
p=[select id from Account where Name='PAAMCO' ];a=new Account(Name='Riverstone Holdings', AnnualRevenue=18713758);a.parentid=p.id;insert a;
p=[select id from Account where Name='Pacific Equity Partners' ];a=new Account(Name='Roark Capital Group', AnnualRevenue=18609879);a.parentid=p.id;insert a;
p=[select id from Account where Name='PAI Partners' ];a=new Account(Name='RPX Corporation', AnnualRevenue=18506000);a.parentid=p.id;insert a;
p=[select id from Account where Name='Pamlico Capital' ];a=new Account(Name='Sentinel Capital Partners', AnnualRevenue=18402121);a.parentid=p.id;insert a;
p=[select id from Account where Name='Pantheon Ventures' ];a=new Account(Name='Silver Lake Partners', AnnualRevenue=18298242);a.parentid=p.id;insert a;
}

if (sectionNumber == 8) { 
p=[select id from Account where Name='Partners Group' ];a=new Account(Name='Silverfleet Capital Partners', AnnualRevenue=18194363);a.parentid=p.id;insert a;
p=[select id from Account where Name='Permira' ];a=new Account(Name='SL Capital Partners', AnnualRevenue=18090484);a.parentid=p.id;insert a;
p=[select id from Account where Name='Phoenix Equity Partners' ];a=new Account(Name='Stabilis Capital Management[5]', AnnualRevenue=17986605);a.parentid=p.id;insert a;
p=[select id from Account where Name='Platinum Equity' ];a=new Account(Name='Starwood Capital Group', AnnualRevenue=17882726);a.parentid=p.id;insert a;
p=[select id from Account where Name='OpCapita' ];a=new Account(Name='Summit Partners', AnnualRevenue=17778847);a.parentid=p.id;insert a;
p=[select id from Account where Name='PAAMCO' ];a=new Account(Name='Sun Capital Partners', AnnualRevenue=17674968);a.parentid=p.id;insert a;
p=[select id from Account where Name='Pacific Equity Partners' ];a=new Account(Name='SVG Capital', AnnualRevenue=17571089);a.parentid=p.id;insert a;
p=[select id from Account where Name='PAI Partners' ];a=new Account(Name='Sycamore Partners', AnnualRevenue=17467210);a.parentid=p.id;insert a;
p=[select id from Account where Name='Pamlico Capital' ];a=new Account(Name='Symphony Technology Group', AnnualRevenue=17363331);a.parentid=p.id;insert a;
p=[select id from Account where Name='Pantheon Ventures' ];a=new Account(Name='TA Associates', AnnualRevenue=17259452);a.parentid=p.id;insert a;
p=[select id from Account where Name='Partners Group' ];a=new Account(Name='Tavistock Group', AnnualRevenue=17155573);a.parentid=p.id;insert a;
p=[select id from Account where Name='Permira' ];a=new Account(Name='TCW/Crescent Mezzanine', AnnualRevenue=17051694);a.parentid=p.id;insert a;
p=[select id from Account where Name='Phoenix Equity Partners' ];a=new Account(Name='Terra Firma Capital Partners', AnnualRevenue=16947815);a.parentid=p.id;insert a;
p=[select id from Account where Name='Platinum Equity' ];a=new Account(Name='Thayer Hidden Creek', AnnualRevenue=16843936);a.parentid=p.id;insert a;
p=[select id from Account where Name='OpCapita' ];a=new Account(Name='Thoma Bravo', AnnualRevenue=16740057);a.parentid=p.id;insert a;
p=[select id from Account where Name='PAAMCO' ];a=new Account(Name='Thoma Cressey Bravo', AnnualRevenue=16636178);a.parentid=p.id;insert a;
p=[select id from Account where Name='Pacific Equity Partners' ];a=new Account(Name='Thomas H. Lee Partners', AnnualRevenue=16532299);a.parentid=p.id;insert a;
p=[select id from Account where Name='PAI Partners' ];a=new Account(Name='TowerBrook Capital Partners', AnnualRevenue=16428420);a.parentid=p.id;insert a;
p=[select id from Account where Name='Pamlico Capital' ];a=new Account(Name='TPG Capital', AnnualRevenue=16324541);a.parentid=p.id;insert a;
p=[select id from Account where Name='Pantheon Ventures' ];a=new Account(Name='Trian Partners[6]', AnnualRevenue=16220662);a.parentid=p.id;insert a;
p=[select id from Account where Name='Partners Group' ];a=new Account(Name='Trilantic Capital Partners', AnnualRevenue=16116783);a.parentid=p.id;insert a;
p=[select id from Account where Name='Permira' ];a=new Account(Name='Trivest', AnnualRevenue=16012904);a.parentid=p.id;insert a;
p=[select id from Account where Name='Phoenix Equity Partners' ];a=new Account(Name='TSG Consumer Partners', AnnualRevenue=15909025);a.parentid=p.id;insert a;
p=[select id from Account where Name='Platinum Equity' ];a=new Account(Name='Veronis Suhler Stevenson', AnnualRevenue=15805146);a.parentid=p.id;insert a;
p=[select id from Account where Name='Thoma Cressey Bravo' ];a=new Account(Name='Vestar Capital Partners', AnnualRevenue=15701267);a.parentid=p.id;insert a;
p=[select id from Account where Name='Thomas H. Lee Partners' ];a=new Account(Name='Vista Equity Partners', AnnualRevenue=15597388);a.parentid=p.id;insert a;
p=[select id from Account where Name='TowerBrook Capital Partners' ];a=new Account(Name='Vitruvian Partners', AnnualRevenue=15493509);a.parentid=p.id;insert a;
p=[select id from Account where Name='TPG Capital' ];a=new Account(Name='Vulcan Capital Management', AnnualRevenue=15389630);a.parentid=p.id;insert a;
p=[select id from Account where Name='Trian Partners[6]' ];a=new Account(Name='Warburg Pincus', AnnualRevenue=15285751);a.parentid=p.id;insert a;
p=[select id from Account where Name='Trilantic Capital Partners' ];a=new Account(Name='Warwick Energy Group', AnnualRevenue=15181872);a.parentid=p.id;insert a;
p=[select id from Account where Name='Trivest' ];a=new Account(Name='Wellspring Capital Management', AnnualRevenue=15077993);a.parentid=p.id;insert a;
p=[select id from Account where Name='TSG Consumer Partners' ];a=new Account(Name='Welsh, Carson, Anderson & Stowe', AnnualRevenue=14974114);a.parentid=p.id;insert a;
p=[select id from Account where Name='Veronis Suhler Stevenson' ];a=new Account(Name='Wesray Capital Corporation', AnnualRevenue=14870235);a.parentid=p.id;insert a;
p=[select id from Account where Name='Trilantic Capital Partners' ];a=new Account(Name='Weston Presidio', AnnualRevenue=14766356);a.parentid=p.id;insert a;
p=[select id from Account where Name='Trivest' ];a=new Account(Name='Willis Stein & Partners', AnnualRevenue=14662477);a.parentid=p.id;insert a;
p=[select id from Account where Name='TSG Consumer Partners' ];a=new Account(Name='Wind Point Partners', AnnualRevenue=14558598);a.parentid=p.id;insert a;
p=[select id from Account where Name='Veronis Suhler Stevenson' ];a=new Account(Name='WL Ross & Co.', AnnualRevenue=14454719);a.parentid=p.id;insert a;
p=[select id from Account where Name='Trilantic Capital Partners' ];a=new Account(Name='Yucaipa Cos.', AnnualRevenue=14350840);a.parentid=p.id;insert a;
p=[select id from Account where Name='Trivest' ];a=new Account(Name='Zelnick Media Capital', AnnualRevenue=14246961);a.parentid=p.id;insert a;
p=[select id from Account where Name='TSG Consumer Partners' ];a=new Account(Name='Zhongzhi Capital', AnnualRevenue=14143082);a.parentid=p.id;insert a;
}

if (sectionNumber == 9) { 
p=[select id from Account where Name='3G Capital' ];
o=new Opportunity(Name='2018 Q3 Renewal', StageName='Closed Won', Amount=35827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,6,30);insert o;
o=new Opportunity(Name='2018 Q4 Renewal', StageName='Closed Won', Amount=25827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,9,30);insert o;
o=new Opportunity(Name='2019 Q1 Renewal', StageName='Closed Won', Amount=15827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,12,30);insert o;
o=new Opportunity(Name='2019 Q2 Renewal', StageName='Qualification', Amount=32827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,3,30);insert o;
o=new Opportunity(Name='2019 Q3 Renewal', StageName='Needs Analysis', Amount=39827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,6,30);insert o;
o=new Opportunity(Name='2019 Q4 Renewal', StageName='Closed Lost', Amount=5827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,9,30);insert o;
p=[select id from Account where Name='3i' ];a=new Account(Name='Affinity Equity Partners', AnnualRevenue=38243010);
o=new Opportunity(Name='2018 Q3 Renewal', StageName='Closed Won', Amount=35827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,6,30);insert o;
o=new Opportunity(Name='2018 Q4 Renewal', StageName='Closed Won', Amount=25827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,9,30);insert o;
o=new Opportunity(Name='2019 Q1 Renewal', StageName='Closed Won', Amount=15827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,12,30);insert o;
o=new Opportunity(Name='2019 Q2 Renewal', StageName='Qualification', Amount=32827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,3,30);insert o;
o=new Opportunity(Name='2019 Q3 Renewal', StageName='Needs Analysis', Amount=39827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,6,30);insert o;
o=new Opportunity(Name='2019 Q4 Renewal', StageName='Closed Lost', Amount=5827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,9,30);insert o;
p=[select id from Account where Name='ABRY Partners' ];a=new Account(Name='American Securities', AnnualRevenue=37931373);
o=new Opportunity(Name='2018 Q3 Renewal', StageName='Closed Won', Amount=35827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,6,30);insert o;
o=new Opportunity(Name='2018 Q4 Renewal', StageName='Closed Won', Amount=25827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,9,30);insert o;
o=new Opportunity(Name='2019 Q1 Renewal', StageName='Closed Won', Amount=15827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,12,30);insert o;
o=new Opportunity(Name='2019 Q2 Renewal', StageName='Qualification', Amount=32827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,3,30);insert o;
o=new Opportunity(Name='2019 Q3 Renewal', StageName='Needs Analysis', Amount=39827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,6,30);insert o;
o=new Opportunity(Name='2019 Q4 Renewal', StageName='Closed Lost', Amount=5827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,9,30);insert o;
p=[select id from Account where Name='ABS Capital' ];a=new Account(Name='Altor Equity Partners', AnnualRevenue=38035252);
o=new Opportunity(Name='2018 Q3 Renewal', StageName='Closed Won', Amount=35827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,6,30);insert o;
o=new Opportunity(Name='2018 Q4 Renewal', StageName='Closed Won', Amount=25827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,9,30);insert o;
o=new Opportunity(Name='2019 Q1 Renewal', StageName='Closed Won', Amount=15827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,12,30);insert o;
o=new Opportunity(Name='2019 Q2 Renewal', StageName='Qualification', Amount=32827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,3,30);insert o;
o=new Opportunity(Name='2019 Q3 Renewal', StageName='Needs Analysis', Amount=39827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,6,30);insert o;
o=new Opportunity(Name='2019 Q4 Renewal', StageName='Closed Lost', Amount=5827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,9,30);insert o;
p=[select id from Account where Name='Accel-KKR' ];a=new Account(Name='Angelo, Gordon & Co.', AnnualRevenue=37827494);
o=new Opportunity(Name='2018 Q3 Renewal', StageName='Closed Won', Amount=35827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,6,30);insert o;
o=new Opportunity(Name='2018 Q4 Renewal', StageName='Closed Won', Amount=25827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,9,30);insert o;
o=new Opportunity(Name='2019 Q1 Renewal', StageName='Closed Won', Amount=15827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,12,30);insert o;
o=new Opportunity(Name='2019 Q2 Renewal', StageName='Qualification', Amount=32827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,3,30);insert o;
o=new Opportunity(Name='2019 Q3 Renewal', StageName='Needs Analysis', Amount=39827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,6,30);insert o;
o=new Opportunity(Name='2019 Q4 Renewal', StageName='Closed Lost', Amount=5827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,9,30);insert o;
p=[select id from Account where Name='Actera Group' ];a=new Account(Name='Apax Partners', AnnualRevenue=37723615);
o=new Opportunity(Name='2018 Q3 Renewal', StageName='Closed Won', Amount=35827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,6,30);insert o;
o=new Opportunity(Name='2018 Q4 Renewal', StageName='Closed Won', Amount=25827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,9,30);insert o;
o=new Opportunity(Name='2019 Q1 Renewal', StageName='Closed Won', Amount=15827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,12,30);insert o;
o=new Opportunity(Name='2019 Q2 Renewal', StageName='Qualification', Amount=32827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,3,30);insert o;
o=new Opportunity(Name='2019 Q3 Renewal', StageName='Needs Analysis', Amount=39827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,6,30);insert o;
o=new Opportunity(Name='2019 Q4 Renewal', StageName='Closed Lost', Amount=5827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,9,30);insert o;
p=[select id from Account where Name='Actis' ];a=new Account(Name='Apollo Management', AnnualRevenue=37619736);
o=new Opportunity(Name='2018 Q3 Renewal', StageName='Closed Won', Amount=35827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,6,30);insert o;
o=new Opportunity(Name='2018 Q4 Renewal', StageName='Closed Won', Amount=25827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,9,30);insert o;
o=new Opportunity(Name='2019 Q1 Renewal', StageName='Closed Won', Amount=15827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,12,30);insert o;
o=new Opportunity(Name='2019 Q2 Renewal', StageName='Qualification', Amount=32827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,3,30);insert o;
o=new Opportunity(Name='2019 Q3 Renewal', StageName='Needs Analysis', Amount=39827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,6,30);insert o;
o=new Opportunity(Name='2019 Q4 Renewal', StageName='Closed Lost', Amount=5827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,9,30);insert o;
p=[select id from Account where Name='Advent International' ];a=new Account(Name='Arcapita', AnnualRevenue=37515857);
o=new Opportunity(Name='2018 Q3 Renewal', StageName='Closed Won', Amount=35827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,6,30);insert o;
o=new Opportunity(Name='2018 Q4 Renewal', StageName='Closed Won', Amount=25827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,9,30);insert o;
o=new Opportunity(Name='2019 Q1 Renewal', StageName='Closed Won', Amount=15827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,12,30);insert o;
o=new Opportunity(Name='2019 Q2 Renewal', StageName='Qualification', Amount=32827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,3,30);insert o;
o=new Opportunity(Name='2019 Q3 Renewal', StageName='Needs Analysis', Amount=39827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,6,30);insert o;
o=new Opportunity(Name='2019 Q4 Renewal', StageName='Closed Lost', Amount=5827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,9,30);insert o;
p=[select id from Account where Name='AEA Investors' ];a=new Account(Name='Ardian (formerly AXA Private Equity)', AnnualRevenue=37411978);
o=new Opportunity(Name='2018 Q3 Renewal', StageName='Closed Won', Amount=35827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,6,30);insert o;
o=new Opportunity(Name='2018 Q4 Renewal', StageName='Closed Won', Amount=25827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,9,30);insert o;
o=new Opportunity(Name='2019 Q1 Renewal', StageName='Closed Won', Amount=15827);o.accountid=p.id;o.CloseDate = Date.newInstance(2018,12,30);insert o;
o=new Opportunity(Name='2019 Q2 Renewal', StageName='Qualification', Amount=32827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,3,30);insert o;
o=new Opportunity(Name='2019 Q3 Renewal', StageName='Needs Analysis', Amount=39827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,6,30);insert o;
o=new Opportunity(Name='2019 Q4 Renewal', StageName='Closed Lost', Amount=5827);o.accountid=p.id;o.CloseDate = Date.newInstance(2019,9,30);insert o;
}

 }

}
