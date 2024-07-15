#!/bin/bash

# Vérification si l'utilisateur est root
if [[ $EUID -ne 0 ]]; then
   echo "Ce script doit être exécuté en tant que root"
   exit 1
fi

# Fonction pour synchroniser avec ntpd
synchronize_with_ntpd() {
    echo "Synchronisation de l'heure avec ntpd..."
    # Installer ntp si non installé
    if ! command -v ntpd &> /dev/null; then
        echo "ntpd n'est pas installé. Installation de ntp..."
        apt-get update && apt-get install -y ntp
    fi

    # Redémarrer le service ntp pour resynchroniser
    systemctl restart ntp
    echo "Synchronisation de l'heure terminée avec ntpd."
}

# Fonction pour synchroniser avec systemd-timesyncd
synchronize_with_systemd_timesyncd() {
    echo "Synchronisation de l'heure avec systemd-timesyncd..."
    # Activer et démarrer le service systemd-timesyncd
    systemctl enable systemd-timesyncd
    systemctl start systemd-timesyncd

    # Forcer la resynchronisation immédiate
    timedatectl set-ntp true
    systemctl restart systemd-timesyncd
    echo "Synchronisation de l'heure terminée avec systemd-timesyncd."
}

# Déterminer quel service utiliser pour la synchronisation
if command -v ntpd &> /dev/null; then
    synchronize_with_ntpd
elif command -v systemctl &> /dev/null && systemctl list-units --type=service | grep -q "systemd-timesyncd"; then
    synchronize_with_systemd_timesyncd
else
    echo "Aucun service de synchronisation d'heure approprié trouvé. Veuillez installer ntpd ou systemd-timesyncd."
    exit 1
fi

# Afficher l'heure actuelle pour vérification
echo "Heure actuelle du système :"
date