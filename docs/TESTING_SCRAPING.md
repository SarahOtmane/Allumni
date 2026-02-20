# Guide de Test : Scraping LinkedIn

Ce document explique comment tester le système d'enrichissement automatique des profils Alumni via LinkedIn.

## 1. Prérequis
Assurez-vous que l'infrastructure est lancée :
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

## 2. Préparation du fichier CSV
Créez un fichier `test_import.csv` avec le format suivant :
```csv
Nom,Prénom,Email,URL Linkedin,Année de diplôme,Quel diplôme
Doe,John,john.doe.test@example.com,https://www.linkedin.com/in/williamhgates,2025,Informatique
```
*(Note : L'URL de Bill Gates est utilisée ici car elle est publique et stable pour les tests).*

## 3. Procédure de Test

### Étape A : Importation
1. Connectez-vous en tant qu'**ADMIN** sur l'interface (http://localhost:4200).
2. Allez dans **Gestion des Promotions**.
3. Sélectionnez la promotion **2025**.
4. Cliquez sur **Importer CSV** et choisissez votre fichier.

### Étape B : Observation du Backend
Surveillez les logs du container `server` pour voir le worker s'activer :
```bash
docker compose logs -f server
```
Vous devriez voir passer des logs du type :
- `[ScrapingService] Enqueuing scraping job for alumni...`
- `[ScrapingProcessor] Processing scraping job for alumni...`
- `[ScrapingProcessor] Found data for ... : Founder at Microsoft`

### Étape C : Vérification en Base de Données
Connectez-vous à MySQL pour vérifier que les champs ont été remplis :
```bash
docker compose exec mysql_db mysql -u alumni_user -p alumni_db
```
Puis lancez la requête :
```sql
SELECT first_name, last_name, current_position, company, data_enriched 
FROM alumni_profiles 
WHERE email = 'john.doe.test@example.com';
```

## 4. Cas de tests à valider
- [ ] **Succès** : Un profil avec un lien valide est enrichi en < 1 min.
- [ ] **Lien manquant** : L'import réussit mais le scraping est ignoré (log `No LinkedIn URL`).
- [ ] **Lien invalide** : Le worker tente 3 fois (retry strategy) puis marque l'échec dans les logs sans bloquer l'application.
