# README

ceci et la racine principale du code du TPE connecter

vous trouverez ici tout les fichier source ainsi que le shéma de cablage et la documentation du TPE

## mise en place :

### Programmation :

- installer l'extension [PlatformIO](https://platformio.org/) _(PIO)_ sur [VS code](https://code.visualstudio.com/) _(plus d'info [ici](https://platformio.org/install/ide?install=vscode).)_

- une fois l'installation faite aller dans le dossier TPE et l'ouvrir avec VScode _(le dossier doit être a la racine de l'ouverture et non le projet complet si non PIO le détectera pas)_

- crée le fichier [secrets.ini](./secrets.ini) a partire du fichier example du même nom

- brancher le tpe au pc (prise de l'esp)

- cliquer sur le bouton d'upload "➡"

  - attendre la fin du processus

- si l'affichage `==== [SUCCESS] Took XX.XX seconds =====` apparaît la compilation et l'upload du code dans le TPE c'est bien passé.

  - si non contacter @clément Boesmier sur teams ^^

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

- pour la création des utilisateurs, de leur conte et leur mettre des crédit voir la doc de l'api dans ../api

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
