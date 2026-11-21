# Le Galion · Carte en ligne

Carte du restaurant Le Galion (Sanary-sur-Mer), servie sur https://legalion-sanary.fr
et ouverte par le QR code des cartes papier.

- `menu.json` : tout le contenu de la carte en français (à modifier à chaque saison)
- `translations.json` : nos traductions (en, es, de, it, nl), clé = texte français exact. Aucune traduction automatique. Après chaque modification de `menu.json`, lancer `python3 outils/verifier-traductions.py` et compléter les textes manquants
- `menu.js` : rendu de la carte à partir de `menu.json`
- `styles.css`, `fonts/`, `images/` : identité visuelle

Déploiement automatique sur Vercel à chaque push sur `main`.
L'ancienne adresse `paper34.fr/FLASHCODE/LEGALION` redirige ici (308) pour les anciens QR codes.

Paper34 · Benjamin Sanchez
