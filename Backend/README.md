# Spring Boot + Oracle TimesTen — Guide Complet

## Architecture

```
Windows Host
├── Java 17 + Spring Boot App  (port 8080)
└── Docker Desktop
    └── tt_server container    (ports 6624/6625)
        └── TimesTen 22.1.1.36.0
            └── PFE_DB
                ├── TIMESTEN.CUSTOMERS
                └── TIMESTEN.SENSOR_LOGS
```

---

## 1. Prérequis

| Outil        | Version minimale |
|--------------|-----------------|
| Java         | 17              |
| Maven        | 3.8+            |
| Docker       | Desktop         |
| TimesTen     | 22.1.1.36.0     |

---

## 2. Préparer le driver JDBC

Le driver TimesTen **n'est pas sur Maven Central**.  
Vous l'avez déjà copié avec `docker cp` :

```powershell
# Copier le JAR depuis le container (déjà fait)
docker cp tt_server:/timesten/instance1/install/lib/ttjdbc17.jar .

# Créer le dossier lib/ dans le projet
mkdir lib
copy ttjdbc17.jar lib\
```

Le `pom.xml` utilise une dépendance `system` qui pointe vers `lib/ttjdbc17.jar`.

---

## 3. Démarrer le container TimesTen

```powershell
# Démarrer le container
docker start tt_server

# Vérifier qu'il tourne
docker ps

# Vérifier que TimesTen daemon est actif
docker exec -it tt_server bash
ttStatus

# Si le daemon est arrêté :
rm -f /timesten/instance1/info/timestend.pid
ttDaemonAdmin -start
```

---

## 4. URL de connexion JDBC

```
jdbc:timesten:client:TTC_Server=localhost;TTC_Server_DSN=PFE_DB;TTC_SERVER_PORT=6625
```

| Paramètre       | Valeur      | Description                        |
|-----------------|-------------|------------------------------------|
| TTC_Server      | localhost   | IP/hostname du serveur TimesTen    |
| TTC_Server_DSN  | PFE_DB      | Nom du Data Store                  |
| TTC_SERVER_PORT | 6625        | Port du TimesTen server (pas 6624) |

> ⚠️ Port **6625** = TimesTen Server (connexions client)  
> Port **6624** = TimesTen Daemon (administration)

---

## 5. Lancer l'application

```powershell
# Depuis la racine du projet
mvn spring-boot:run
```

Ou en JAR :
```powershell
mvn clean package -DskipTests
java -jar target/timesten-springboot-1.0.0.jar
```

---

## 6. Tester les endpoints REST

### Health check
```bash
GET http://localhost:8080/api/health
```
Réponse attendue :
```json
{
  "status": "UP",
  "database": "Oracle TimesTen",
  "message": "TimesTen OK"
}
```

---

### Customers — CRUD complet

#### Créer un client
```bash
POST http://localhost:8080/api/customers
Content-Type: application/json

{
  "custId": 1,
  "name": "Ahmed Ben Ali",
  "balance": 500.000,
  "status": "ACTIVE"
}
```

#### Lister tous les clients
```bash
GET http://localhost:8080/api/customers
```

#### Filtrer par statut
```bash
GET http://localhost:8080/api/customers?status=ACTIVE
```

#### Clients actifs avec solde minimum
```bash
GET http://localhost:8080/api/customers/active?minBalance=100
```

#### Obtenir un client
```bash
GET http://localhost:8080/api/customers/1
```

#### Modifier un client
```bash
PUT http://localhost:8080/api/customers/1
Content-Type: application/json

{
  "custId": 1,
  "name": "Ahmed Ben Ali",
  "balance": 750.000,
  "status": "ACTIVE"
}
```

#### Modifier le solde uniquement
```bash
PATCH http://localhost:8080/api/customers/1/balance
Content-Type: application/json

{ "balance": 999.999 }
```

#### Désactiver un client
```bash
PATCH http://localhost:8080/api/customers/1/deactivate
```

#### Supprimer un client
```bash
DELETE http://localhost:8080/api/customers/1
```

---

## 7. Structure du projet

```
timesten-springboot/
├── lib/
│   └── ttjdbc17.jar              ← Driver JDBC TimesTen (à copier manuellement)
├── src/
│   └── main/
│       ├── java/com/example/timesten/
│       │   ├── TimesTenApplication.java
│       │   ├── config/
│       │   │   ├── DataSourceConfig.java      ← Configuration HikariCP + TimesTen
│       │   │   └── GlobalExceptionHandler.java
│       │   ├── controller/
│       │   │   ├── CustomerController.java    ← API REST /api/customers
│       │   │   └── HealthController.java      ← API REST /api/health
│       │   ├── model/
│       │   │   ├── Customer.java              ← Entité TIMESTEN.CUSTOMERS
│       │   │   └── SensorLog.java             ← Entité TIMESTEN.SENSOR_LOGS
│       │   ├── repository/
│       │   │   └── CustomerRepository.java    ← Spring Data JPA
│       │   └── service/
│       │       └── CustomerService.java       ← Logique métier
│       └── resources/
│           └── application.properties         ← Configuration datasource
└── pom.xml
```

---

## 8. Problèmes courants

### ❌ "Could not connect to the TimesTen daemon"
```bash
docker exec -it tt_server bash
rm -f /timesten/instance1/info/timestend.pid
ttDaemonAdmin -start
```

### ❌ "ClassNotFoundException: com.timesten.jdbc..."
→ Le fichier `lib/ttjdbc17.jar` est manquant.
```powershell
docker cp tt_server:/timesten/instance1/install/lib/ttjdbc17.jar lib/
```

### ❌ Erreur de connexion port 6624
→ Utiliser le port **6625** (TimesTen Server), pas 6624 (Daemon).

### ❌ "No suitable driver found"
→ Vérifier que `includeSystemScope=true` est dans le plugin Maven.

---

## 9. Créer des données de test dans TimesTen

```bash
docker exec -it tt_server bash
ttIsql "Driver=/timesten/instance1/install/lib/libtten.so;DataStore=/timesten/info/PFE_DB;DatabaseCharacterSet=AL32UTF8;PermSize=128"

Command> INSERT INTO TIMESTEN.CUSTOMERS VALUES (1, 'Ahmed Ben Ali', 500.000, 'ACTIVE');
Command> INSERT INTO TIMESTEN.CUSTOMERS VALUES (2, 'Fatima Zahra', 250.500, 'ACTIVE');
Command> INSERT INTO TIMESTEN.CUSTOMERS VALUES (3, 'Mohamed Salah', 0.000, 'INACTIVE');
Command> COMMIT;
Command> SELECT * FROM TIMESTEN.CUSTOMERS;
```
