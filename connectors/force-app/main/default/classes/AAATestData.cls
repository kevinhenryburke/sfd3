public inherited sharing class AAATestData {

/* In Execute Anonymous run, sequentially

AAATestData aaa = new AAATestData();
aaa.insertData(1);

AAATestData aaa = new AAATestData();
aaa.insertOpportunities();

AAATestData aaa = new AAATestData();
aaa.runScripts(9);

*/

    Integer plevel = -1; // Parent Level
    Integer pindex = 0; // Parent Index


    List<List<Account>> las = new List<List<Account>>();

    List<Account> la = new List<Account>();

/*
    private void nextLevel () {
        insert la;
        las.add(la);
        la = new List<Account>();
        plevel++;
        pindex = 0;
    }

    private void finish () {
        insert la;
        las.add(la);
        la = new List<Account>();
    }

    private void nextParent () {
        pindex++;
    }

    private void addAccount (String name, Decimal revenue) {
        Account a = new Account();
        a.Name=name;
        a.AnnualRevenue=revenue;
        if (plevel > -1) {
            a.ParentId = las[plevel][pindex].id;
        }
        la.add(a);
    }

    public void insertData(Integer sectionNumber) {

        Account a;
        Account p;
        Opportunity o;

        if (sectionNumber == 1) { 
            addAccount ('Burke Enterprises', 39281800);

            nextLevel() ; // 1

            System.debug('new level 1: ' + plevel);

            addAccount('3i', 39177921);
            addAccount('3G Capital', 39074042);
            addAccount('ABS Capital', 38970163);
            addAccount('ABRY Partners', 38866284);
            addAccount('Accel-KKR', 38762405);
            addAccount('Actera Group', 38658526);
            addAccount('Actis', 38554647);
            addAccount('Advent International', 38450768);
            addAccount('AEA Investors', 38346889);

            nextLevel() ; // 2

            System.debug('new level 2: ' + plevel);

            addAccount('AlpInvest Partners', 38139131);
            addAccount('Arlington Capital Partners', 37204220);
            addAccount('Berkshire Partners', 36269309);
            addAccount('Brynwood Partners', 35334398);
            addAccount('Carlyle Group', 34607245);
            addAccount('Charterhouse Capital Partners', 33880092);
            addAccount('Clarity Partners', 33152939);
            addAccount('Coller Capital', 32841302);
            addAccount('Court Square Capital Partners', 32529665);
            nextParent(); 
            addAccount('Affinity Equity Partners', 38243010);
            addAccount('Ares Management', 37308099);
            addAccount('BDT Capital Partners', 36373188);
            addAccount('Bruckmann, Rosser, Sherrill & Co.', 35438277);
            addAccount('Capvis', 34711124);
            addAccount('Charlesbank Capital Partners', 33983971);
            addAccount('CIVC Partners', 33256818);
            addAccount('Close Brothers Group', 32945181);
            addAccount('Conquest Asset Management', 32633544);
            nextParent(); 
            addAccount('American Securities', 37931373);
            addAccount('Auldbrass Partners', 36996462);
            addAccount('Blackstone Group', 36061551);
            addAccount('Butler Capital Partners', 35126640);
            addAccount('Catterton Partners', 34399487);
            addAccount('Chicago Growth Partners', 33672334);
            nextParent(); 
            addAccount('Altor Equity Partners', 38035252);
            addAccount('Audax Group', 37100341);
            addAccount('BIP Investment Partners', 36165430);
            addAccount('Brysam Global Partners', 35230519);
            addAccount('Castle Harlan', 34503366);
            addAccount('Charterhouse Group', 33776213);
            addAccount('Clayton, Dubilier & Rice', 33049060);
            addAccount('Colony Capital', 32737423);
            addAccount('Crestview Partners', 32425786);
            nextParent(); 
            addAccount('Angelo, Gordon & Co.', 37827494);
            addAccount('Avenue Capital Group', 36892583);
            addAccount('Blum Capital', 35957672);
            addAccount('Campeau Corporation', 35022761);
            addAccount('CCMP Capital', 34295608);
            addAccount('China-Africa Development Fund', 33568455);
            nextParent(); 
            addAccount('Apax Partners', 37723615);
            addAccount('Avista Capital Partners', 36788704);
            addAccount('Brentwood Associates', 35853793);
            addAccount('Candover Investments', 34918882);
            addAccount('Centerbridge Partners', 34191729);
            addAccount('CI Capital Partners', 33464576);
            nextParent(); 
            addAccount('Apollo Management', 37619736);
            addAccount('Bain Capital', 36684825);
            addAccount('Bridgepoint Capital', 35749914);
            addAccount('CapMan', 34815003);
            addAccount('Cerberus Capital Management', 34087850);
            addAccount('Cinven', 33360697);
            nextParent(); 
            addAccount('Arcapita', 37515857);
            addAccount('Baring Vostok Capital Partners', 36580946);
            addAccount('Brockway Moran & Partners', 35646035);
            nextParent(); 
            addAccount('Ardian (formerly AXA Private Equity)', 37411978);
            addAccount('BC Partners', 36477067);
            addAccount('Brookfield Asset Management', 35542156);

            nextLevel() ; // 3

            System.debug('new level 3: ' + plevel);

            addAccount('CrossHarbor Capital Partners', 32321907);
            addAccount('Investcorp', 26400804);
            nextParent(); 
            addAccount('Crossroads Group', 32218028);
            addAccount('Irving Place Capital', 26296925);
            nextParent(); 
            addAccount('CVC Capital Partners', 32114149);
            addAccount('J.H. Whitney & Company', 26193046);
            nextParent(); 
            addAccount('Cypress Group', 32010270);
            addAccount('J.W. Childs Associates', 26089167);
            nextParent(); 
            addAccount('Defoe Fournier & Cie.', 31906391);
            addAccount('Jadwa Investment', 25985288);
            nextParent(); 
            addAccount('Diamond Castle Holdings', 31802512);
            addAccount('JC Flowers', 25881409);
            nextParent(); 
            addAccount('Digital Sky Technologies', 31698633);
            addAccount('JLL Partners', 25777530);
            nextParent(); 
            addAccount('DLJ Merchant Banking Partners', 31594754);
            addAccount('JMI Equity', 25673651);
            nextParent(); 
            addAccount('Doughty Hanson & Co', 31490875);
            addAccount('Jordan Company', 25569772);
            nextParent(); 
            addAccount('Kelso & Company', 25465893);
            nextParent(); 
            addAccount('Duke Street Capital', 31283117);
            addAccount('Kennet Partners', 25362014);
            nextParent(); 
            addAccount('Electra Private Equity', 31179238);
            addAccount('Khosla Ventures', 25258135);
            nextParent(); 
            addAccount('Elevation Partners', 31075359);
            addAccount('Kinderhook Industries', 25154256);
            nextParent(); 
            addAccount('EnerVest[3]', 30971480);
            addAccount('Kleiner Perkins Caufield & Byers', 25050377);
            addAccount('MidOcean Partners', 22453402);
            nextParent(); 
            addAccount('EQT Partners', 30867601);
            addAccount('Kohlberg & Company', 24946498);
            addAccount('Morgan Stanley Private Equity', 22349523);
            nextParent(); 
            addAccount('Eurazeo', 30763722);
            addAccount('Kohlberg Kravis Roberts', 24842619);
            addAccount('Morgenthaler', 22245644);
            nextParent(); 
            addAccount('Fenway Partners', 30659843);
            addAccount('KRG Capital', 24738740);
            addAccount('New Mountain Capital', 22141765);
            nextParent(); 
            addAccount('Ferd', 30555964);
            addAccount('Lake Capital', 24634861);
            addAccount('Newbridge Capital', 22037886);
            nextParent(); 
            addAccount('First Reserve Corporation', 30452085);
            addAccount('Landmark Partners', 24530982);
            addAccount('Nordic Capital', 21934007);
            nextParent(); 
            addAccount('Forstmann Little & Company', 30348206);
            addAccount('Lee Equity Partners', 24427103);
            addAccount('NRDC Equity Partners', 21830128);
            nextParent(); 
            addAccount('Fortress Investment Group', 30244327);
            addAccount('Leeds Equity Partners', 24323224);
            nextParent(); 
            addAccount('Founders Circle Capital', 30140448);
            nextParent(); 
            addAccount('Leonard Green & Partners', 24219345);
            addAccount('Fox Paine & Company', 30036569);
            addAccount('Leopard Capital LP', 24115466);
            nextParent(); 
            addAccount('Francisco Partners', 29932690);
            nextParent(); 
            addAccount('Lexington Partners', 24011587);
            addAccount('Freeman Spogli & Co.', 29828811);
            nextParent(); 
            addAccount('Liechtenstein LGT Capital Partners', 23907708);
            addAccount('Fremont Group', 29724932);
            nextParent(); 
            addAccount('Lightyear Capital', 23803829);
            addAccount('Friedman Fleischer & Lowe', 29621053);
            addAccount('Lincolnshire Management', 23699950);
            nextParent(); 
            addAccount('Frontenac Company', 29517174);
            nextParent(); 
            addAccount('Lindsay Goldberg Bessemer', 23596071);
            addAccount('General Atlantic', 29413295);
            nextParent(); 
            addAccount('Littlejohn & Co.', 23492192);
            addAccount('Genstar Capital', 29309416);
            nextParent(); 
            addAccount('Livingbridge', 23388313);
            addAccount('GFH Capital', 29205537);
            nextParent(); 
            addAccount('Lone Star Funds', 23284434);
            nextParent(); 
            addAccount('GI Partners', 29101658);
            addAccount('LRG Capital Funds', 23180555);
            addAccount('GIMV', 28997779);
            addAccount('Lux Capital', 23076676);
            addAccount('Golden Gate Capital Partners', 28893900);
            nextParent(); 
            addAccount('Madison Dearborn Partners', 22972797);
            nextParent(); 
            addAccount('Goldman Sachs Capital Partners', 28790021);
            nextParent(); 
            addAccount('MatlinPatterson Global Advisors', 22868918);
            addAccount('Gores Group', 28686142);
            addAccount('Mekong Capital', 22765039);
            nextParent(); 
            addAccount('GP Investimentos', 28582263);
            nextParent(); 
            addAccount('Metalmark Capital', 22661160);
            addAccount('Graphite Capital', 28478384);
            nextParent(); 
            addAccount('Hungary Mid Europa Partners', 22557281);
            addAccount('GTCR', 28374505);
            nextParent(); 
            addAccount('H&Q Asia Pacific', 28270626);
            addAccount('H.I.G. Capital', 28166747);
            nextParent(); 
            addAccount('Harbert Management Corporation', 28062868);
            nextParent(); 
            addAccount('HarbourVest Partners', 27958989);
            nextParent(); 
            addAccount('Harvest Partners', 27855110);
            addAccount('HBG Holdings', 27751231);
            addAccount('Heartland Industrial Partners', 27647352);
            nextParent(); 
            addAccount('Hellman & Friedman', 27543473);
            nextParent(); 
            addAccount('HgCapital', 27439594);
            addAccount('Highbridge Capital Management', 27335715);
            addAccount('Highland Capital Management', 27231836);
            nextParent(); 
            addAccount('Hillhouse Capital Group', 27127957);
            nextParent(); 
            addAccount('HM Capital Partners', 27024078);
            nextParent(); 
            addAccount('Hony Capital', 26920199);
            addAccount('IK Investment Partners', 26816320);
            nextParent(); 
            addAccount('InFrontier Ltd [4]', 26712441);
            nextParent(); 
            addAccount('InterMedia Partners', 26608562);
            nextParent(); 
            addAccount('Intermediate Capital Group', 26504683);

            nextLevel();

            System.debug('new level 4: ' + plevel);


            addAccount('Oak Hill Capital Partners', 21726249);
            addAccount('Oak Investment Partners', 21622370);
            nextParent(); 
            addAccount('Oaktree Capital Management', 21518491);
            addAccount('Ocean Avenue Capital Partners', 21414612);
            nextParent(); 
            addAccount('Olympus Partners', 21310733);
            nextParent(); 
            addAccount('OMERS', 21206854);
            nextParent(); 
            addAccount('One Equity Partners', 21102975);
            addAccount('Onex Corporation', 20999096);
            nextParent(); 
            addAccount('OpCapita', 20895217);
            addAccount('PAAMCO', 20791338);
            nextParent(); 
            addAccount('Pacific Equity Partners', 20687459);
            addAccount('PAI Partners', 20583580);
            nextParent(); 
            addAccount('Pamlico Capital', 20479701);
            addAccount('Pantheon Ventures', 20375822);
            nextParent(); 
            addAccount('Partners Group', 20271943);
            nextParent(); 
            addAccount('Permira', 20168064);
            nextParent(); 
            addAccount('Phoenix Equity Partners', 20064185);
            nextParent(); 
            addAccount('Platinum Equity', 19960306);
            addAccount('Primus Capital', 19856427);
            addAccount('Prospect Partners', 19752548);
            nextParent(); 
            addAccount('Providence Equity Partners', 19648669);
            nextParent(); 
            addAccount('Quadrangle Group', 19544790);
            nextParent(); 
            addAccount('Quadrant Private Equity', 19440911);
            addAccount('Redpoint Ventures', 19337032);
            addAccount('Rhône Group', 19233153);
            nextParent(); 
            addAccount('Riordan, Lewis & Haden', 19129274);
            nextParent(); 
            addAccount('Ripplewood Holdings', 19025395);
            nextParent(); 
            addAccount('Riverside Company', 18921516);
            addAccount('Riverside Partners', 18817637);
            addAccount('Riverstone Holdings', 18713758);
            nextParent(); 
            addAccount('Roark Capital Group', 18609879);
            nextParent(); 
            addAccount('RPX Corporation', 18506000);
            nextParent(); 
            addAccount('Sentinel Capital Partners', 18402121);
            nextParent(); 
            addAccount('Silver Lake Partners', 18298242);

            addAccount('Silverfleet Capital Partners', 18194363);
            nextParent(); 
            addAccount('SL Capital Partners', 18090484);
            nextParent(); 
            addAccount('Stabilis Capital Management[5]', 17986605);
            addAccount('Starwood Capital Group', 17882726);
            addAccount('Summit Partners', 17778847);
            nextParent(); 
            addAccount('Sun Capital Partners', 17674968);
            nextParent(); 
            addAccount('SVG Capital', 17571089);
            nextParent(); 
            addAccount('Sycamore Partners', 17467210);
            nextParent(); 
            addAccount('Symphony Technology Group', 17363331);
            nextParent(); 
            addAccount('TA Associates', 17259452);
            addAccount('Tavistock Group', 17155573);
            addAccount('TCW/Crescent Mezzanine', 17051694);
            nextParent(); 
            addAccount('Terra Firma Capital Partners', 16947815);
            nextParent(); 
            addAccount('Thayer Hidden Creek', 16843936);
            addAccount('Thoma Bravo', 16740057);
            addAccount('Thoma Cressey Bravo', 16636178);
            addAccount('Thomas H. Lee Partners', 16532299);
            nextParent(); 
            addAccount('TowerBrook Capital Partners', 16428420);
            addAccount('TPG Capital', 16324541);
            addAccount('Trian Partners[6]', 16220662);
            nextParent(); 
            addAccount('Trilantic Capital Partners', 16116783);
            nextParent(); 
            addAccount('Trivest', 16012904);
            nextParent(); 
            addAccount('TSG Consumer Partners', 15909025);
            addAccount('Veronis Suhler Stevenson', 15805146);


            nextLevel() ; // 5

            System.debug('new level 5: ' + plevel);

            pindex = 38;

            addAccount('Vestar Capital Partners', 15701267);
            addAccount('Vista Equity Partners', 15597388);
            addAccount('Vitruvian Partners', 15493509);
            nextParent(); 
            addAccount('Vulcan Capital Management', 15389630);
            nextParent(); 
            addAccount('Warburg Pincus', 15285751);
            nextParent(); 
            addAccount('Warwick Energy Group', 15181872);
            nextParent(); 
            addAccount('Wellspring Capital Management', 15077993);
            nextParent(); 
            addAccount('Welsh, Carson, Anderson & Stowe', 14974114);
            addAccount('Wesray Capital Corporation', 14870235);
            addAccount('Weston Presidio', 14766356);
            addAccount('Willis Stein & Partners', 14662477);
            nextParent(); 
            addAccount('Wind Point Partners', 14558598);
            addAccount('WL Ross & Co.', 14454719);
            addAccount('Yucaipa Cos.', 14350840);
            addAccount('Zelnick Media Capital', 14246961);
            addAccount('Zhongzhi Capital', 14143082);


            finish(); 

        }
    }

    public void runScripts (Integer sectionNumber) {
        if (sectionNumber == 9) { 
            List<String> AccountTypeValues = new List<String>();
            List<Schema.PicklistEntry> AccountTypePLE = Account.Type.getDescribe().getPicklistValues();
            for( Schema.PicklistEntry pickListVal : AccountTypePLE){
                AccountTypeValues.add(pickListVal.getLabel());
            }     

            List<String> AccountIndustryValues = new List<String>();
            List<Schema.PicklistEntry> AccountIndustryPLE = Account.Industry.getDescribe().getPicklistValues();
            for( Schema.PicklistEntry pickListVal : AccountIndustryPLE){
                AccountIndustryValues.add(pickListVal.getLabel());
            }     

            List<Account> lau = [select id from Account];
            for (Account au : lau) {
                Double dEmployees = math.random() * 10000;
                au.NumberOfEmployees = dEmployees.intValue();

                Double indexType = math.random() * AccountTypeValues.size();
                au.Type = AccountTypeValues[indexType.intValue()];

                Double indexIndustry = math.random() * AccountIndustryValues.size();
                au.Industry = AccountIndustryValues[indexIndustry.intValue()];
            }
            update lau;
        }
    }

    public void insertOpportunities () {

        Account a;
        Account p;
        Opportunity o;

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

    // THIS METHOD EVENS OUT MANAGERS FOR DEMOS ONLY!! Adds in managers if using SDO

    public static void addManagers () {
        Map<Id,Integer> manLevels = new Map<Id,Integer>();
        Set<Id> manIds = new Set<Id>();
        List<Id> manIdsList = new List<Id>();
        Map<Integer,List<User>> levels = new Map<Integer,List<User>>();


        List<User> listMan =
            [select id, ManagerId from User where usertype = 'Standard' and ManagerId != null];

        Integer hierLevel = 1;

        for(User userMan : listMan ) {
            // these are managers
            manLevels.put(userMan.ManagerId, hierLevel);
            manIds.add(userMan.ManagerId);
            manIdsList.add(userMan.ManagerId);
        }

        // These guys need to be assigned managers
        List<User> nonManagersWithNoManagers =
            [select id, ManagerId from User where usertype = 'Standard' and ManagerId = null and Id NOT IN :manIds];

        while (manIds.size() > 1) {
            hierLevel++;
            listMan =
                [select id, ManagerId from User where usertype = 'Standard' and Id IN :manIds];
            
            manIds = new Set<Id>();
            for(User userMan : listMan ) {
                if (userMan.ManagerId != null) {
                    // these are hierarchy managers
                    manLevels.put(userMan.ManagerId, hierLevel);
                    manIds.add(userMan.ManagerId);            
                    manIdsList.add(userMan.ManagerId);            
                }
            }        
        }

        System.debug(manLevels);

        // Simple for now - just add these guys into levels

        Integer manIdsSize = manIds.size();

        for (Integer i = 0; i < nonManagersWithNoManagers.size(); i++ ) {
            
        //    Double dEmployees = math.random() * manIdsSize;
        //    Integer randomManager = dEmployees.intValue();

            Integer randomManager = Math.mod(i ,manIdsList.size());     
            System.debug(randomManager);
            
            nonManagersWithNoManagers[i].ManagerId = manIdsList[randomManager];
        }

        update nonManagersWithNoManagers;



    }
*/

}
