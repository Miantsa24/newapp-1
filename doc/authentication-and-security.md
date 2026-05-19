0# Protection des Pages Backoffice - Documentation Technique

## 📋 Vue d'ensemble

Le système de protection des pages Backoffice utilise une architecture en trois couches :

1. **AuthService** : Service d'authentification et gestion de session
2. **ProtectedRoute** : Composant React pour protéger les routes
3. **LoginPage** : Page d'authentification avec gestion des sessions expirées

---

## 🔐 Flux d'authentification

### 1. Connexion initiale (LoginPage)

```
Utilisateur → formulaire email/password
                    ↓
            AuthService.login()
                    ↓
            Appel API /api/employees
                    ↓
            Validation bcrypt du password
                    ↓
            Création session localStorage
                    ↓
            Navigation vers dashboard
```

**Données stockées dans localStorage :**
```javascript
{
  id: "123",
  email: "admin@shop.com",
  firstname: "Jean",
  lastname: "Dupont",
  loggedAt: 1715000000000  // Timestamp du login
}
```

---

## ⏱️ Gestion de Session et Timeout

### Paramètres de sécurité

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| `SESSION_TIMEOUT` | 30 min | Durée maximale d'inactivité avant expiration |
| `WARNING_TIME` | 5 min | Avertissement avant expiration (5 min avant) |
| `Réinitialisation` | À chaque interaction | Reset du timer sur mousedown, keydown, touchstart |

### Chronologie

```
T=0 min      : Utilisateur connecté / interaction
              → Timer 30 min → Expiration
              → Timer 25 min → Avertissement

T=25 min     : ⚠️ Notification "Session expire dans 5 min"
              (L'utilisateur peut continuer son activité)

T=25+ min    : Utilisateur interagit avec la page
              → Timer réinitialisé
              → loggedAt mis à jour
              → Notification cachée

T=30 min     : Pas d'interaction depuis 30 min
              → Session expirée
              → Redirection /admin/login
              → Message d'expiration affiché
```

---

## 🛡️ Protection des Routes

### ProtectedRoute Component

Le composant `ProtectedRoute` enveloppe les pages du BO :

```jsx
<Route path="/dashboard" 
  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
```

**Fonctionnalités :**
- ✅ Vérifie `AuthService.isLoggedIn()`
- ✅ Valide l'expiration de session
- ✅ Affiche avertissement avant expiration
- ✅ Redirige vers login si expirée
- ✅ Récupère l'inactivité utilisateur

### Pages protégées

#### Tableau de bord
- `/` → Dashboard
- `/admin/dashboard` → Dashboard

#### Produits
- `/products` → ProductList
- `/product/:id` → ProductDetailPage
- `/product/edit/:id` → ProductEditPage
- `/product/new` → ProductEditPage (création)
- `/products/import` → ProductImportPage

#### Catégories
- `/categories` → CategoryList
- `/categories/new` → CategoryFormPage
- `/categories/edit/:id` → CategoryFormPage
- `/categories/:id` → CategoryDetailPage

#### Clients
- `/customers` → CustomerList
- `/customers/new` → CustomerFormPage
- `/customers/edit/:id` → CustomerFormPage
- `/customers/:id` → CustomerDetailPage

#### Autres
- `/reinitialisation` → ReinitialisationPage

---

## 🔑 Méthodes AuthService

### Authentification

```javascript
// Login : Vérifie credentials et crée session
const result = await AuthService.login(email, password);
// { success: true, user: {...} } ou { success: false, error: "..." }

// Logout : Supprime la session
AuthService.logout();

// Vérifie si connecté
if (AuthService.isLoggedIn()) { ... }

// Récupère l'utilisateur connecté
const user = AuthService.getUser();
```

### Gestion de session

```javascript
// Vérifie si la session est valide (existe + pas expirée)
if (AuthService.isSessionValid()) { ... }

// Temps restant avant expiration (en ms)
const remaining = AuthService.getSessionRemainingTime();
// -1 si expirée ou inexistante
// > 0 si active
```

---

## 🚨 Scénarios de Sécurité

### Cas 1 : Utilisateur inactif 30+ min

```
T=30 min    : Expiration timeout déclenché
            → AuthService.logout()
            → localStorage.setItem("sessionExpired", "true")
            → Navigate("/admin/login")

T=30+ min   : LoginPage affiche message d'expiration
            → Utilisateur doit se reconnecter
```

### Cas 2 : Utilisateur actif

```
T=0-25 min  : Pas de notification
            → Timer continue

T=25 min    : Notification d'avertissement
            → Utilisateur clique/tape
            → loggedAt réinitialisé
            → Timer réarmé
            → Notification disparaît
```

### Cas 3 : Tentative d'accès sans login

```
Requête /dashboard
        ↓
ProtectedRoute vérifie isLoggedIn()
        ↓
❌ false → <Navigate to="/admin/login" />
```

### Cas 4 : Session invalid (localStorage corrompu)

```
AuthService.getUser() → null
        ↓
isSessionValid() → false
        ↓
ProtectedRoute → Redirection login
```

---

## 🔒 Stockage Sécurisé

### localStorage

**Avantages :**
- Persiste sur la page (F5, navigation)
- Facile à accéder
- Suffisant pour l'authentification BO

**Sécurité :**
- ✅ PrestaShop API en HTTPS
- ✅ Pas de token stocké (session courte)
- ✅ Pas de passwords stockés (validation bcrypt côté API)
- ✅ Timer d'expiration automatique
- ✅ Détection d'inactivité

### Headers API

Toutes les requêtes API utilisent Basic Auth :

```javascript
Authorization: "Basic " + btoa(API_KEY + ":")
```

---

## 🔧 Configuration

### À modifier dans `.env` ou `config/apiConfig.js`

```javascript
export const API_CONFIG = {
  BASE_URL: "https://prestashop.local/api",
  API_KEY: "votre_cle_api", // À générer dans PrestaShop
};
```

### Permissions API requises

Dans PrestaShop : **Paramètres avancés > Webservice > Clé API**

✅ **Permissions requises :**
- `GET` sur `/employees` (authentification)
- `GET` sur `/products`, `/categories`, `/customers` (lecture BO)
- `PUT`/`POST` selon les besoins

---

## 📝 Logs et Debugging

### Vérifier l'authentification

```javascript
// Dans la console du navigateur
AuthService.isLoggedIn()        // true/false
AuthService.getUser()           // {id, email, ...}
AuthService.isSessionValid()    // true/false
AuthService.getSessionRemainingTime()  // temps en ms
localStorage.getItem("adminSession")  // JSON brut
```

### Problèmes courants

| Problème | Cause | Solution |
|----------|-------|----------|
| Redirection boucle | API inaccessible | Vérifier BASE_URL et API_KEY |
| Session expire trop tôt | Timer mal réinitialisé | Recharger la page |
| Mot de passe refusé | Hash bcrypt invalide | Vérifier PrestaShop 8.x+ |
| Session persist après logout | Mauvaise clé localStorage | Effacer localStorage manuellement |

---

## 🎯 Prochaines améliorations

1. **Refresh Token** : Implémenter un système de refresh token
2. **Rôles/Permissions** : Ajouter des vérifications de droits par page
3. **Audit Trail** : Logger les connexions/déconnexions
4. **2FA** : Authentification à deux facteurs
5. **CSRF Protection** : Tokens anti-CSRF sur les formulaires
6. **Rate Limiting** : Limiter les tentatives de connexion

---

## 📞 Support

Pour toute question sur l'authentification ou la sécurité, vérifiez :
- ✅ Console du navigateur pour les logs
- ✅ Onglet Network pour les requêtes API
- ✅ localStorage pour les données de session
