// Municipios del País Vasco agrupados por provincia.
// Si falta alguno, añádelo a mano en la lista correspondiente.
const MUNICIPIOS = {
  "Bizkaia": [
    "Abadiño","Abanto y Ciérvana","Ajangiz","Alonsotegi","Amorebieta-Etxano","Amoroto",
    "Arakaldo","Arantzazu","Areatza","Arrankudiaga","Arratzu","Arrieta","Arrigorriaga",
    "Artea","Artzentales","Atxondo","Aulesti","Bakio","Balmaseda","Barakaldo","Barrika",
    "Basauri","Bedia","Berango","Bermeo","Berriatua","Berriz","Bilbao","Busturia",
    "Karrantza","Derio","Dima","Durango","Ea","Elantxobe","Elorrio","Erandio","Ereño",
    "Ermua","Errigoiti","Etxebarri","Etxebarria","Forua","Fruiz","Galdakao","Galdames",
    "Gamiz-Fika","Garai","Gatika","Gautegiz Arteaga","Gernika-Lumo","Getxo","Gizaburuaga",
    "Gordexola","Gorliz","Güeñes","Ibarrangelu","Igorre","Iurreta","Izurtza","Lanestosa",
    "Larrabetzu","Laukiz","Leioa","Lekeitio","Lemoa","Lemoiz","Lezama","Loiu","Mallabia",
    "Mañaria","Markina-Xemein","Maruri-Jatabe","Mendata","Mendexa","Meñaka","Mundaka",
    "Mungia","Munitibar","Murueta","Muskiz","Muxika","Nabarniz","Ondarroa","Orduña",
    "Orozko","Ortuella","Otxandio","Plentzia","Portugalete","Santurtzi","Sestao","Sondika",
    "Sopela","Sopuerta","Trucios-Turtzioz","Ubide","Ugao-Miraballes","Urduliz",
    "Valle de Trápaga-Trapagaran","Zaldibar","Zalla","Zamudio","Zaratamo","Zeanuri",
    "Zeberio","Zierbena","Ziortza-Bolibar"
  ],
  "Gipuzkoa": [
    "Abaltzisketa","Aduna","Aizarnazabal","Albiztur","Alegia","Alkiza","Altzaga","Altzo",
    "Amezketa","Andoain","Anoeta","Antzuola","Aretxabaleta","Arrasate/Mondragón","Asteasu",
    "Astigarraga","Ataun","Azkoitia","Azpeitia","Baliarrain","Beasain","Beizama","Belauntza",
    "Berastegi","Bergara","Berrobi","Bidegoian","Deba","Donostia/San Sebastián","Eibar",
    "Elduain","Elgeta","Elgoibar","Errenteria","Errezil","Eskoriatza","Ezkio-Itsaso",
    "Gabiria","Gaintza","Gaztelu","Getaria","Hernani","Hernialde","Hondarribia","Ibarra",
    "Idiazabal","Ikaztegieta","Irun","Irura","Itsasondo","Itziar","Larraul","Lasarte-Oria","Lazkao",
    "Leaburu","Legazpi","Legorreta","Leintz-Gatzaga","Lezo","Lizartza","Mendaro","Mutiloa",
    "Mutriku","Oiartzun","Olaberria","Oñati","Ordizia","Orendain","Orexa","Orio",
    "Ormaiztegi","Pasaia","Segura","Soraluze/Placencia de las Armas","Tolosa","Urnieta",
    "Urretxu","Usurbil","Villabona","Zaldibia","Zarautz","Zegama","Zerain","Zestoa",
    "Zizurkil","Zumaia","Zumarraga"
  ],
  "Araba": [
    "Agurain/Salvatierra","Amurrio","Aramaio","Armiñón","Arraia-Maeztu","Artziniega","Asparrena",
    "Aiara/Ayala","Añana","Baños de Ebro/Mañueta","Barrundia","Berantevilla","Bernedo",
    "Kanpezu/Campezo","Elburgo/Burgelu","Elciego","Bilar/Elvillar","Erriberabeitia",
    "Erriberagoitia/Ribera Alta","Harana/Valle de Arana","Iruña Oka/Iruña de Oca",
    "Iruraiz-Gauna","Kuartango","Labastida/Bastida","Lagrán","Laguardia",
    "Lantziego/Lanciego","Lantarón","Lapuebla de Labarca","Laudio/Llodio","Legutio","Leza",
    "Moreda de Álava","Navaridas","Okondo","Oyón-Oion","Peñacerrada-Urizaharra","Samaniego",
    "Donemiliaga/San Millán","Urkabustaiz","Valdegovía/Gaubea","Villabuena de Álava",
    "Vitoria-Gasteiz","Yécora/Iekora","Zalduondo","Zambrana","Zigoitia","Zuia"
  ]
};
