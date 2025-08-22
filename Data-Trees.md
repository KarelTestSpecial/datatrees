# **Data-Trees IT-Project Specificaties: Kennisstructuur & Webintegratie**

## **1\. Doel & Overzicht**

Dit project heeft als doel gebruikers/bezoekers een zo volledig mogelijk overzicht aan te bieden van het kennisveld rond een bepaald onderwerp, door het gestructureerd verzamelen, organiseren en tonen van informatie. De kernfunctionaliteit ligt in het creëren van een **hiërarchische kennisstructuur** die direct gekoppeld is aan webbronnen. Dit stelt bezoekers in staat om hun kennis op een visuele en logische manier te vergaren.

### **Doelgroep**

1. Aanbieders die een dergelijke hiërarchische structuur willen aanmaken.  
2. Consumers die behoefte hebben aan een gestructureerde visuele manier om een kennisveld te overzien en te verwerven.

## **2\. Kernfunctionaliteiten**

### **2.1 Hiërarchische Kennisstructuur opbouwen (deel van het project dat dient voor Aanbieders)**

* **Creëren:** Aanbieder kunnen een nieuwe kennisstructuur opbouwen door middel van **een geautomatiseerd kennis-zoek-systeem** die zoekresultaten omzet naar een hiërarchisch gestructureerd kennisoverzicht.  
* **Structuur:** De structuur is hiërarchisch, wat betekent dat knooppunten ondergeschikt kunnen zijn aan andere knooppunten. Dit creëert een boomstructuur die de relatie tussen concepten weergeeft.  
* **Bewerken:** Aanbieders kunnen de kennisstructuur aanpassen door knooppunten toevoegen, bewerken en verwijderen. Het is mogelijk om knooppunten te verslepen om de hiërarchie aan te passen.  
* **Opslaan:** De volledige structuur, inclusief de inhoud van elk knooppunt, kan worden opgeslagen en geladen voor later gebruik. De standaardoutput is een txt-bestand dat de hiërarchie opslaat met behulp van indentatie (aantal tabs voor de tekst op een regel).

### **2.2 Hiërarchische Kennisstructuur aanbieden (deel van het project voor Consumers)**

* **Inlezen van bestanden:** Het comsumer gedeelte van dit project (de consumer-webapp) moet in staat zijn om de door de Aanbieders gegenereerde tekstbestanden (.txt) in te lezen. (Bestandsoverdracht)  
* **Automatische structuur:** De app analyseert de inhoud van het bestand en genereert op basis de indentatie (aantal tabs en/of spaties voor de tekst op iedere lijn) de hiërarchische structuur. (Structuurconversie)  
* **Twee weergavemodi:**  
  * **Accordeonweergave:** De structuur wordt gepresenteerd als een inklapbare en uitklapbare lijst, ideaal voor een overzichtelijke presentatie van de inhoud.  
  * **Sitestructuurweergave:** De structuur wordt visueel weergegeven als een boomdiagram, vergelijkbaar met een sitemap, wat de hiërarchie en relaties in één oogopslag duidelijk maakt.  
* **Google Search Integratie**  
  * **Query-generatie:** De tekst / titel van een knooppunt is aanklikbaar, en genereert een Google-search. De tekst / titels van alle nodes langsheen het hele broodkruimelpad van de aangeklikte node worden gebruikt om de query-string van de zoekopdracht te genereren.  
  * **Dynamische hyperlink:** De titel van het knooppunt wordt een hyperlink. Bij het klikken op deze hyperlink, opent een nieuw tabblad in de browser met de zoekresultaten van Google voor de betreffende zoekopdracht.  
  * **Efficiëntie:** Deze functionaliteit maakt het mogelijk om met één klik vanuit de app direct gerelateerde informatie op het web te vinden.

## **3\. Gebruikersinterface (UI) & Gebruikerservaring (UX)**

* **Lay-out:**  
  * voor Aanbieders: Een duidelijke, intuïtieve interface met een centraal werkgebied voor de kennisstructuur en zijbalk voor bestandsbeheer en bewerkingsopties.  
  * voor Consumers: Een duidelijke ‘browsable’ accordeon-structuur op een one-page website met al de kennis over één onderwerp op één plaats samengebracht in een overzichtelijke datastructuur  
* **Functionaliteit voor aanbieders:**  
  * **Slepen & Neerzetten:** De mogelijkheid om knooppunten te verslepen is essentieel voor een soepele interactie.  
  * **Feedback:** Visuele feedback (bijvoorbeeld via laadindicatoren) is belangrijk tijdens het verwerken van bestanden en het openen van zoekopdrachten.  
* **Responsief Ontwerp:** De app moet goed functioneren op zowel desktop als mobiele apparaten.