# Network Clock (NC) Project

## Présentation du Projet

Le projet Network Clock (NC) est une application permettant de visualiser et de régler la date et l'heure du système. L'application offre les fonctionnalités suivantes :
- Affichage de la date et de l'heure actuelles avec un format spécifié par l'utilisateur.
- Réglage de la date et de l'heure du système par l'utilisateur interactif.
- Serveur TCP permettant aux utilisateurs distants de demander la date et l'heure actuelles dans un format spécifié.

## Choix de la Technologie

Pour ce projet, Java a été choisi comme langage de programmation principal. Cette décision est basée sur les avantages suivants :

### Avantages de Java

1. **Portabilité et Robustesse**:
   - Java est un langage de programmation portable grâce à la machine virtuelle Java (JVM), ce qui garantit une exécution cohérente sur différentes plateformes, y compris Debian.
   - La robustesse de Java, grâce à son typage statique et à son système de gestion des exceptions, contribue à minimiser les erreurs à l'exécution et à améliorer la fiabilité de l'application.

2. **Gestion des Threads et Concurrence**:
   - Java offre une gestion des threads intégrée, ce qui est essentiel pour gérer les connexions réseau simultanées et exécuter des tâches en parallèle.
   - Les bibliothèques et outils de concurrence de Java sont bien documentés et largement utilisés, facilitant le développement d'applications performantes et réactives.

3. **Écosystème de Bibliothèques et Outils de Développement**:
   - Java dispose d'un riche écosystème de bibliothèques et de frameworks, y compris pour la création d'interfaces utilisateur graphiques (JavaFX), la communication réseau (`java.net`), et la gestion des privilèges (`ProcessBuilder`).
   - Les environnements de développement intégrés (IDE) comme IntelliJ IDEA, Eclipse, et NetBeans offrent des outils puissants pour le développement, le débogage et la maintenance du code.

### Réponse aux Exigences du Projet

Pour répondre aux exigences spécifiques du projet, voici comment Java et ses technologies seront utilisés :

1. **Interface Utilisateur Graphique avec JavaFX**:
   - JavaFX sera utilisé pour créer l'interface utilisateur de l'application Network Clock (NC). JavaFX offre des fonctionnalités avancées pour la création d'interfaces graphiques modernes et réactives.
   - L'interface utilisateur permettra à l'utilisateur interactif de visualiser la date et l'heure actuelles, de spécifier le format d'affichage, et de régler l'heure du système.

2. **Communication Réseau avec `java.net`**:
   - Le package `java.net` de Java sera utilisé pour implémenter le serveur TCP. Ce serveur écoutera les connexions sur un port configurable, recevra les demandes des utilisateurs distants, et renverra la date et l'heure actuelles dans le format spécifié.
   - Le serveur sera conçu pour gérer les requêtes fractionnées et combinées, ainsi que pour valider les entrées pour éviter les vulnérabilités telles que les dépassements de tampon et les abus de chaîne de format.

3. **Gestion des Privilèges avec `ProcessBuilder` et `sudo`**:
   - Pour régler l'heure du système, une séparation des privilèges sera mise en œuvre. Une application distincte, exécutée avec des privilèges élevés, sera responsable de cette tâche.
   - `ProcessBuilder` sera utilisé pour exécuter des commandes système avec `sudo`, demandant à l'utilisateur les privilèges nécessaires pour régler l'heure. Cette approche minimise les risques de sécurité en s'assurant que seules les tâches privilégiées spécifiques sont exécutées avec des privilèges élevés.

4. **Configuration et Gestion des Fichiers**:
   - Les configurations, y compris le numéro de port TCP, seront stockées dans des fichiers de configuration accessibles en écriture par l'utilisateur, situés dans le répertoire `%USERPROFILE%/AppData/Local/Clock/` ou une clé de registre spécifique.
   - Les bibliothèques Java standard telles que `java.nio.file` seront utilisées pour gérer les chemins et les fichiers de manière sécurisée.

## Instructions pour Exécuter le Projet

### Prérequis

- [Java Development Kit (JDK)](https://www.oracle.com/java/technologies/javase-downloads.html) installé
- Un environnement de développement intégré (IDE) comme [IntelliJ IDEA](https://www.jetbrains.com/idea/) ou [Eclipse](https://www.eclipse.org/)
- Un système Debian ou une distribution Linux similaire avec des permissions administratives (super-utilisateur) pour pouvoir exécuter des commandes nécessitant des privilèges élevés

### Étapes pour Exécuter le Projet

1. **Cloner le Répertoire du Projet**:
   ```sh
   git clone https://github.com/Oceane4973/Network_clock
   cd Network_clock
