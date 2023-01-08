# README

ceci et la racine principale du code du TPE connecté

vous trouverez ici tous les fichiers source ainsi que le schéma de câblage et la documentation du TPE

Pour la génération de la doc Doxygen le fichier [Doxyfile](./docs/Doxyfile) se trouve dans le docs.

il crées par défaut la [sortie](./docs/Doxygen%20output) dans "docs/Doxygen output"

il utilise aussi graphviz pour généré les graphiques.

## mise en place :

### Programmation :

- installer l'extension [PlatformIO](https://platformio.org/) _(PIO)_ sur [VS code](https://code.visualstudio.com/) _(plus d'info [ici](https://platformio.org/install/ide?install=vscode).)_

- une fois l'installation faite aller dans le dossier TPE et l'ouvrir avec VScode _(le dossier doit être a la racine de l'ouverture et non le projet complet si non PIO le détectera pas)_

- crée le fichier [secrets.ini](./secrets.ini) à partir du fichier exemple du même nom

- brancher le TPE au PC (prise de l'ESP)

- cliquer sur le bouton d'upload "➡"

- si l'affichage `==== [SUCCESS] Took XX.XX seconds =====` apparaît la compilation et l'upload du code dans le TPE c'est bien passé.

![image](https://user-images.githubusercontent.com/16057094/211200016-746c32a3-2fb4-495b-8f92-be7c00f88e6b.png)


### Installation :

- brancher une des prises du lecteur QRcode a une alimentation (ou au téléphone via hub)

- brancher la prise USB du l'esp32 au téléphone

- l'écran s'allume avec écrit `Connexion WiFi...`

  - l'or de la 1er utilisation cet écran reste figé

  - se connecter sur le wifi généré par l'ESP (voir user/password dans [secrets.ini](./secrets.ini))

  - une fois connecter allez sur l'adresse [192.168.4.1](http://192.168.4.1) et renseigner les user password du wifi local

  - une fois le wifi connecter appuyer sur le bouton "EN" ou débrancher rebrancher l'esp pour le redémarré

- si les opérations se sont bien passées, l'écran doit afficher bienvenue

### Utilisation :

- pour une utilisation sans le téléphone il faut envoyer la valeur que l'on veut envoyer en centime via le port série émulé par l'esp via un moniteur série comme celui de [putty](https://www.putty.org/) ou [arduino IDE](https://www.arduino.cc/en/software#legacy-ide-18x). la vitesse du port par défaut est 115200

- pour la création des utilisateurs, de leur conte et leur mettre des crédit voir la doc de l'api dans ../api _(il faut au minimum)_ :

  - crée deux utilisateurs (un commerçant et un client)

  - mettre des crédit au client _(via l'utilisation de prisa studio)_

  - mettre un des IDs des badge NFC en id de carte au client _(pour rappel)_ :

    - rond bleu : 77991033

    - carte blanche : A766C64D

  - crées un id de chèque au client (id a utilisation unique)

_seul un des deux derniers points est requit à voir suivant les tests voulues_

### pour la création des QRcode chèque :

- récupéré un id de chèque en base

- aller sur un site de création de QRcode (type [qrcode-monkey](https://www.qrcode-monkey.com/#text)) _attention un site qui ne fait pas de QRcode de redirection_

  - format du text QRcode : `{"UUID":[ID_chèque],"amount":[PRIX]}` (_ex:_)

    - `{"UUID":"1fa8c95f-e356-4f73-bb33-1571f2d87d62","amount":"100"}`

    - `{"UUID":"89e869d4-1a1a-4d70-81f1-b0572ace8942","amount":"100"}`

    (_rappel tous les prix sont en centime_)

    (caque id de QRcode son a utilisation unique)

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
