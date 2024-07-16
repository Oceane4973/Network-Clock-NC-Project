# Network Clock (NC) Project

## Présentation du Projet
Le projet Network Clock (NC) est une application permettant de visualiser et de régler la date et l'heure du système. L'application offre les fonctionnalités suivantes :

- Affichage de la date et de l'heure actuelles avec un format spécifié par l'utilisateur.
- Réglage de la date et de l'heure du système par l'utilisateur interactif.
- Serveur TCP permettant aux utilisateurs distants de demander la date et l'heure actuelles dans un format spécifié.

## Choix de la Technologie
Pour ce projet, Kotlin et Ktor ont été choisis pour le développement du serveur, tandis que l'interface utilisateur utilise HTML, CSS et JavaScript.

### Avantages de Kotlin et Ktor

#### Portabilité et Robustesse
- **Portabilité**: Kotlin est un langage de programmation moderne et multi-plateforme, ce qui permet une exécution cohérente sur différentes plateformes, y compris Debian.
- **Robustesse**: Grâce à son typage statique et à son système de gestion des exceptions, Kotlin minimise les erreurs à l'exécution et améliore la fiabilité de l'application.

#### Gestion des Threads et Concurrence
- **Gestion intégrée des threads**: Ktor offre une gestion des threads intégrée, essentielle pour gérer les connexions réseau simultanées et exécuter des tâches en parallèle.
- **Outils de concurrence bien documentés**: Les bibliothèques et outils de concurrence de Kotlin et Ktor facilitent le développement d'applications performantes et réactives.

#### Écosystème de Bibliothèques et Outils de Développement
- **Écosystème riche**: Kotlin dispose d'un riche écosystème de bibliothèques et de frameworks pour la création d'interfaces utilisateur graphiques et la communication réseau.
- **Environnements de développement intégrés (IDE)**: IntelliJ IDEA, Eclipse et autres offrent des outils puissants pour le développement, le débogage et la maintenance du code.

## Réponse aux Exigences du Projet

### Interface Utilisateur Graphique
L'interface utilisateur est créée à l'aide de HTML, CSS et JavaScript, et elle est hébergée sur le serveur Ktor. Elle permet à l'utilisateur interactif de visualiser la date et l'heure actuelles, de spécifier le format d'affichage, et de régler l'heure du système.

### Communication Réseau avec Ktor
Le package Ktor de Kotlin est utilisé pour implémenter le serveur TCP. Ce serveur écoute les connexions sur un port configurable, reçoit les demandes des utilisateurs distants, et renvoie la date et l'heure actuelles dans le format spécifié.

### Gestion des Privilèges avec ProcessBuilder et sudo
Pour régler l'heure du système, une séparation des privilèges est mise en œuvre. Un script bash exécuté avec des privilèges élevés est responsable de cette tâche. ProcessBuilder est utilisé pour exécuter des commandes système avec sudo, demandant à l'utilisateur les privilèges nécessaires pour régler l'heure.

### Configuration et Gestion des Fichiers
Les configurations, y compris le numéro de port TCP, sont stockées dans des fichiers de configuration accessibles en écriture par l'utilisateur, situés dans le répertoire `src/main/resources/config/`.

## Instructions pour Exécuter le Projet

### Prérequis
- Java Development Kit (JDK) installé
- Un environnement de développement intégré (IDE) comme IntelliJ IDEA ou Eclipse
- Un système Debian ou une distribution Linux similaire avec des permissions administratives (super-utilisateur) pour pouvoir exécuter des commandes nécessitant des privilèges élevés

### Étapes pour Exécuter le Projet

#### Cloner le Répertoire du Projet
```bash
git clone https://github.com/Oceane4973/Network_clock
cd Network_clock
```

## Configuration des Scripts
Le projet utilise des scripts bash pour gérer les privilèges et l'exécution.

### Exécution du Script `build-and-run.sh`
Ce script s'assure que les dépendances sont installées, construit le projet, et exécute l'application sous un nouvel utilisateur système dont les seuls privilèges élevés sont `date` et le script de changement d'heure dont le chemin est spécifié dans le fichier de configuration `app.properties`.
```bash
chmod +x build-and-run.sh
./build-and-run.sh
```

#### Détails du script `build-and-run.sh` :
1. **Vérification et récupération des propriétés** : Le script vérifie la présence du fichier de configuration et récupère les propriétés nécessaires comme le chemin du script et le nom d'utilisateur.
2. **Création de l'utilisateur** : Si l'utilisateur spécifié n'existe pas, il est créé avec un mot de passe généré.
3. **Copie et configuration du projet** : Le répertoire du projet est copié dans un répertoire temporaire, et les permissions sont ajustées pour que le nouvel utilisateur ait accès.
4. **Configuration de sudoers** : Le script ajoute une entrée dans sudoers pour permettre à l'utilisateur d'exécuter le script de changement d'heure et la commande `date` sans mot de passe.
5. **Construction, tests et exécution du projet** : Le script nettoie, installe les dépendances npm, construit, exécute les tests JavaScript et Kotlin du projet et lance le serveur Ktor en tant que le nouvel utilisateur système.

## Tests 
Le projet inclut plusieurs types de tests pour garantir la sécurité, la robustesse et la performance de l'application.

### Tests Javascript

#### Tests de Sécurité
Des tests sont effectués pour vérifier la résistance de l'application aux injections de commandes et autres attaques malveillantes.

```javascript
// Exemple de test de détection de commandes malveillantes
test('should detect malicious commands', () => {
    const maliciousCommands = [
        '<script>alert("hack")</script>',
        'rm -rf /',
        'wget http://malicious.com',
        'nc --set-time "yyyy-MM-dd HH:mm:ss" "2023-07-15 12:30:45" ; rm -rf /',
        'base64 -d <<< "dGVzdA==" | sh'
    ];

    maliciousCommands.forEach((command) => {
        expect(terminal.isMaliciousCommand(command)).toBe(true);
    });
});
```

#### Tests des Composants DOM
Les tests sur les composants DOM de l'application, tels que les éléments de l'horloge et le terminal, sont réalisés pour s'assurer de leur bon fonctionnement et de leur mise à jour correcte.

```javascript
// Exemple de test sur le composant horloge
test('should update the time and date elements', () => {
   const testDate = new Date(2023, 6, 15, 12, 30, 45); // 15 July 2023, 12:30:45
   clock.update(testDate);

   expect(clockElement.querySelector('.time').textContent).toBe('12:30:45');
   expect(clockElement.querySelector('.date').textContent).toBe('2023-07-15 SAT');
});
```

#### Tests d'Intégration
Les tests d'intégration vérifient que les différents modules de l'application fonctionnent correctement ensemble.

```javascript
// Exemple de test d'intégration
test('should display help message when nc --help is executed', () => {
    const promptElement = terminal.promptElement;
    promptElement.innerText = 'nc --help';
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    promptElement.dispatchEvent(event);

    const historyContent = document.querySelector('.history').textContent;
    expect(historyContent).toContain('Usage:');
    expect(historyContent).toContain('nc --help');
    expect(historyContent).toContain('nc --set-time');
});
```

#### Tests de Performance
Des tests de performance sont également réalisés pour s'assurer que les opérations critiques s'exécutent dans des délais acceptables.

```javascript
// Exemple de test de performance
test('update method should be performant', () => {
    const start = performance.now();
    clock.update(new Date());
    const end = performance.now();
    expect(end - start).toBeLessThan(50); // L'opération doit prendre moins de 50ms
});
```