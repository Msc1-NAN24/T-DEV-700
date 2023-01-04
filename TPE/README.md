# README

ceci et la racine principale du code du TPE connecter

vous trouverez ici tout les fichier source ainsi que le schéma de câblage et la documentation du TPE

Pour la génération de la doc Doxygen le fichier [Doxyfile](./docs/Doxyfile) se trouve dans le docs.

il crées par defaut la [sortie](./docs/Doxygen%20output) dans "docs/Doxygen output"

il utilise aussi graphviz pour généré les graphique

## mise en place :

### Programmation :

- installer l'extension [PlatformIO](https://platformio.org/) _(PIO)_ sur [VS code](https://code.visualstudio.com/) _(plus d'info [ici](https://platformio.org/install/ide?install=vscode).)_

- une fois l'installation faite aller dans le dossier TPE et l'ouvrir avec VScode _(le dossier doit être a la racine de l'ouverture et non le projet complet si non PIO le détectera pas)_

- crée le fichier [secrets.ini](./secrets.ini) a partire du fichier example du même nom

- brancher le tpe au pc (prise de l'esp)

- cliquer sur le bouton d'upload "➡"

  - attendre la fin du processus

- si l'affichage `==== [SUCCESS] Took XX.XX seconds =====` apparaît la compilation et l'upload du code dans le TPE c'est bien passé.

### Installation :

- brancher une des prise du lecteur qrcode a une alumenation (ou au telephone via hub)

- brancher la prise usb du l'esp32 au telephone

- l'ecran s'alume avec ecrit `Connection WiFi...`

  - l'or de la 1er utilisation cette ecran reste figé

  - se connecter sur le wifi généré par l'esp (voir user/password dans [secrets.ini](./secrets.ini))

  - une fois connecter allez sur l'adresse [192.168.4.1](http://192.168.4.1) et renseigner les user password du wifi local

  - une fois le wifi connecter appuyer sur le bouton "EN" ou de-brancher rebrancher l'esp pour le redémaré

- si les opération se sont bien passer l'écran doit afficher bienvenue

### Utilisation :

- pour une utilisation sans le téléphone il faut envoyer la valeur que l'on veut envoyer en centime via le port série émulé par l'esp via un moniteur série comme celui de [putty](https://www.putty.org/) ou [arduino IDE](https://www.arduino.cc/en/software#legacy-ide-18x). la vitesse du port par defaut est 115200

- pour la création des utilisateurs, de leur conte et leur mettre des crédit voir la doc de l'api dans ../api _(il faut au minimum)_ :

  - crée 2 utilisateur (un commerçant et un client)

  - mettre des crédit au client _(via l'utilisation de prisa studio)_

  - mettre un des id des badge NFC en id de carte au client _(pour rappel)_ :

    - rond bleu : 77991033

    - carte blanche : A766C64D

  - crées un id de chèque au client (id a utilisation unique)

_seul 1 des 2 dernier point est requit a voir suivant les test voulue_

### pour la création des QRcode chèque :

- récupéré un id de chèque en base

- aller sur un site de création de QRcode (type [qrcode-monkey](https://www.qrcode-monkey.com/#text)) _attention un site qui ne fait pas de qrcode de redirection_

  - format du text qr code : `{"UUID":[ID_chèque],"amount":[PRIX]}` (_ex:_)

    - `{"UUID":"1fa8c95f-e356-4f73-bb33-1571f2d87d62","amount":"100"}`

    - `{"UUID":"89e869d4-1a1a-4d70-81f1-b0572ace8942","amount":"100"}`

    (_rappel tout les prix son en centime_)

    (caque id de qrcode son a utilisation unique)

### Câblage par défaut:

```
    oled:
        VCC -> 3.3V*
        GND -> GND*
        SCL -> D22
        SDA -> D21
    QR code:
        GND -> GND*
        RX -> TX2*
        TX -> RX2*
        alim via usb
    RFID:
        VCC -> 3.3V*
        GND -> GND*
        SDA -> D5*
        SCK -> D18*
        MOSI -> D23*
        MISO -> D19*
        RST -> D15*
```
