# 🔒 Guide Utilisateur - Authentification Backoffice

## 📌 Pour l'Administrateur

### Se connecter

1. Accéder à `http://localhost:5173/admin/login` (ou `https://votresite.com/admin/login`)
2. Entrer votre **email administrateur PrestaShop**
3. Entrer votre **mot de passe** PrestaShop
4. Cliquer **"Se connecter"**

> ℹ️ Les identifiants sont vérifiés auprès de votre API PrestaShop

### Navigation Backoffice

Une fois connecté, vous avez accès à :

- **Dashboard** - Vue d'ensemble
- **Produits** - Gestion des produits, import CSV
- **Catégories** - Gestion des catégories
- **Clients** - Gestion des clients
- **Réinitialisation** - Réinitialisation des données

### Session et Inactivité

**Votre session est active pendant 30 minutes d'inactivité.**

⚠️ **À 25 minutes**, vous verrez une notification orange :
```
Votre session expirera dans 5 minutes. 
Continuez votre activité pour rester connecté.
```

💡 **Pour rester connecté :** Continuez simplement votre travail (clic, saisie, scroll, etc.)

🔄 **Le timer se réinitialise** à chaque interaction, vous pouvez rester aussi longtemps que vous travaillez activement.

### Déconnexion

- Cliquer le bouton **"Déconnexion"** en haut à droite
- Vous serez redirigé vers la page de login
- Votre session est immédiatement supprimée

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| "Email ou mot de passe incorrect" | Credentials invalides | Vérifier votre email/password PrestaShop |
| Redirection boucle vers login | API non accessible | Contacter support technique |
| Session expirée brutalement | Inactivité 30+ min | Reconnecter-vous |

---

## 🛠️ Pour les Développeurs

### Architecture

```
LoginPage (Authentification)
    ↓
App.jsx (Router + Routes)
    ↓
ProtectedRoute (Middleware de protection)
    ↓
Pages BO (Dashboard, Products, etc)
```

### Intégrer une nouvelle page BO protégée

**1. Créer la page dans `src/pages/` :**
```jsx
export default function MyPage() {
  return <div>Ma page</div>;
}
```

**2. Ajouter la route dans `App.jsx` :**
```jsx
import MyPage from "./pages/MyPage";

<Route path="/mypage" 
  element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
```

**3. Ajouter le lien dans `Navbar.jsx` :**
```jsx
const links = [
  // ... autres liens
  { label: "Ma Page", path: "/mypage" },
];
```

### Vérifier l'authentification en composant

```jsx
import AuthService from "../services/authService";

function MyComponent() {
  const user = AuthService.getUser();
  const isValid = AuthService.isSessionValid();
  const remaining = AuthService.getSessionRemainingTime();
  
  if (!isValid) {
    // Session expirée
  }
  
  return <div>Connecté en tant que {user.email}</div>;
}
```

### Calling API avec headers d'authentification

```javascript
import AuthService from "../services/authService";

const response = await fetch(url, {
  headers: AuthService.getHeaders(),
});
```

### Debugging

**Dans la console du navigateur :**

```javascript
// Vérifier l'authentification
AuthService.isLoggedIn()                    // true/false
AuthService.getUser()                       // {id, email, firstname, lastname, loggedAt}
AuthService.isSessionValid()                // true/false
AuthService.getSessionRemainingTime()       // ms restants avant expiration

// Forcer logout (debug)
AuthService.logout()

// Voir les données brutes
localStorage.getItem("adminSession")        // JSON de la session
localStorage.getItem("sessionExpired")      // "true" si expirée
```

### Configuration API

**Fichier :** `src/config/apiConfig.js`

```javascript
export const API_CONFIG = {
  BASE_URL: "https://prestashop.local/api",
  API_KEY: "votre_cle_api",
};
```

**Générer une clé API dans PrestaShop :**
1. Aller dans **Paramètres avancés → Webservice**
2. Créer une nouvelle clé
3. Cocher les permissions nécessaires
4. Copier la clé → `apiConfig.js`

### Permissions API requises

Dans PrestaShop, la clé API doit avoir accès :

```
✅ GET   /employees       (authentification)
✅ GET   /products        (lecture produits)
✅ GET   /categories      (lecture catégories)
✅ GET   /customers       (lecture clients)
✅ PUT   /products        (modification produits)
✅ POST  /products        (création produits)
✅ PUT   /categories      (modification catégories)
✅ POST  /categories      (création catégories)
✅ etc.
```

---

## ⏱️ Paramètres de Sécurité

Ces valeurs sont configurées dans `ProtectedRoute.jsx` :

```javascript
const SESSION_TIMEOUT = 30 * 60 * 1000;     // 30 minutes
const WARNING_TIME = 5 * 60 * 1000;         // Avertir 5 min avant
```

**Pour changer :**
1. Éditer `ProtectedRoute.jsx`
2. Modifier les constantes en haut du fichier
3. Recharger l'app

> ⚠️ Actuellement : 30 min d'inactivité max. L'avertissement s'affiche à 25 min.

---

## 🔐 Sécurité

### Points de sécurité

✅ **Passwords** : Vérifiés avec bcrypt (API PrestaShop)  
✅ **Session** : Stockée avec timestamp pour validation  
✅ **Timeout** : 30 min inactivité (configurable)  
✅ **Réinitialisation** : Automatic au premier accès BO après expiration  
✅ **Logout** : Supprime immédiatement les données de session  

### localStorage

- Contient : ID, email, nom, timestamp login
- N'est PAS sensible (pas de password, pas de token)
- Accessible seulement à cette app
- Valide seulement si timestamp récent

---

## 📞 Support

### Problème : "Email ou mot de passe incorrect"

**Causes possibles :**
1. ❌ Email/password incorrects
2. ❌ Compte admin désactivé dans PrestaShop
3. ❌ API inaccessible

**Solutions :**
1. Vérifier credentials dans PrestaShop → Paramètres avancés → Équipe
2. Vérifier que le compte est **Actif**
3. Vérifier que l'API PrestaShop est en HTTPS et accessible

### Problème : "Impossible de contacter l'API PrestaShop"

**Causes possibles :**
1. ❌ Serveur PrestaShop down
2. ❌ URL de l'API incorrecte
3. ❌ Firewall bloque requête

**Solutions :**
1. Vérifier que PrestaShop est accessible
2. Vérifier `API_CONFIG.BASE_URL` dans `config/apiConfig.js`
3. Vérifier que le protocole est HTTPS

### Problème : "Session expire trop vite"

**Cause :** Probablement une interaction non détectée (ex: scrollbar)

**Solution :** Vérifier que vous cliquez/tapez activement. Si ça persiste, augmenter SESSION_TIMEOUT dans ProtectedRoute.jsx

---

## 📚 Documentation Complète

- [authentication-and-security.md](./authentication-and-security.md) - Architecture technique détaillée
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Résumé de l'implémentation
