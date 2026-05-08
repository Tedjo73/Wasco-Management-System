# DISTRIBUTED ONLINE WATER BILL MANAGEMENT DATABASE APPLICATION
## Water and Sewerage Company (WASCO)

---

### 2. Table of Contents
1. Title of the System
2. Table of Contents
3. List of Figures
4. List of Tables
5. List of Abbreviations
6. Abstract
7. Introduction
   1.1 Problem Statement
   1.2 Problem Solving
   1.3 Objectives
   1.4 Scope & Constraint
8. Technologies Justification
   2.1 Web application technologies
   2.2 Database Management System
9. System Design
   3.1 Data Models
   3.2 Entity Relationship Diagram (ERD)
10. System Implementation
   4.1 Cross-Database Integration
   4.2 Analytical Views (OLAP)
11. Database Security
12. Results and Testing
13. Conclusion
   4.1 Advantages of the System
   4.2 Future Enhancement of the System
   4.3 Potential Benefit
   4.4 Conclusion
15. References
16. Appendices

---

### 3. List of Figures
* Figure 1: Distributed Architecture Diagram (Client-Server-Database)
* Figure 2: Entity Relationship Diagram (ERD) - Core Database
* Figure 3: Entity Relationship Diagram (ERD) - Billing Database
* Figure 4: Application Graphical User Interface Screenshots

### 4. List of Tables
* Table 1: WASCO Customer Account Details
* Table 2: Water Consumption Block Tariff Rates

### 5. List of Abbreviations
* **WASCO**: Water and Sewerage Company
* **API**: Application Programming Interface
* **DBMS**: Database Management System
* **ERD**: Entity Relationship Diagram
* **GUI**: Graphical User Interface
* **JWT**: JSON Web Token
* **SQL**: Structured Query Language

---

### 6. Abstract
The Water and Sewerage Company (WASCO) faces significant challenges in managing customer water usage, determining tiered billing rates, and processing payments across the districts of Lesotho using centralized, legacy systems. This project proposes and implements a Distributed Online Water Bill Management Database Application. Utilizing a modern React-based web interface integrated with a distributed Node.js/Express backend communicating with two **heterogeneous** databases (PostgreSQL and MySQL), the system ensures data isolation and performance. It allows customers to access their portals, report leakages, and pay bills, while granting branch managers powerful analytical tools to view water usage insights across daily, weekly, monthly, and yearly granularities.

---

### 7. Introduction

#### 1.1 Problem Statement
Traditional water billing systems often rely on centralized, monolithic databases that are prone to bottlenecks and lack the flexibility to serve a highly distributed user base across multiple districts. Customers often lack a standardized portal to view current tariffs, track real-time consumption, and identify outstanding arrears. Furthermore, administrators lack adequate GUI dashboards to easily adjust block tariff rates or generate monthly bills dynamically based on varying consumption levels. 

#### 1.2 Problem Solving
We solve these issues by engineering a distributed database application. Customer profiles and leakage tickets are separated from financial operations (invoicing and payments). This separation of concerns is managed by an intelligent backend API that fetches, computes, and serves integrated data to a user-friendly frontend dashboard. By utilizing heterogeneous database systems, we demonstrate the system's ability to integrate diverse data sources into a unified management interface.

#### 1.3 Objectives
1. To design and implement a distributed relational database managing customers, usage, and billing across at least two heterogeneous database systems.
2. To dynamically calculate tiered water consumption bills using embedded SQL via a web server.
3. To track customer payment histories and calculate outstanding balances securely.
4. To provide a modern User Interface (GUI) customized for Customers, Administrators, and Branch Managers, featuring summative analytical insights.

#### 1.4 Scope & Constraint
**Scope:** The system covers all districts in Lesotho. It manages customer verification, dynamic bill generation, leakage reporting, and simulated API payment gateway processing. 
**Constraints:** The system's payment gateway is a simulation modeling true external API behavior. Furthermore, it assumes constant internet connectivity for database synchronization between the heterogeneous nodes.

---

### 8. Technologies Justification

#### 2.1 Web application technologies
* **React.js (via Vite):** Chosen for the frontend GUI. React provides a component-based architecture allowing us to build deeply interactive dashboards (Admin, Customer, Manager) without needing to reload the webpage, thereby creating an extremely smooth Single Page Application (SPA) experience.
* **Node.js & Express:** Chosen as the middleware application server. Node's asynchronous, event-driven architecture makes it the perfect candidate for handling multiple database connections concurrently without blocking, heavily optimizing exactly what is needed for a distributed SQL system.
* **JSON Web Tokens (JWT) & Bcrypt:** Chosen for system security. Passwords are mathematically hashed via Bcrypt before entering the database, and API interactions are secured via stateless JWT bearer tokens.

#### 2.2 Database Management System
To satisfy the requirement for a heterogeneous distributed system, we utilized two distinct DBMS engines:
* **PostgreSQL (wasco_core):** Used for the core customer data, user authentication, and leakage reports. PostgreSQL was selected for its advanced relational features and robust support for complex data types.
* **MySQL (wasco_billing):** Used for the high-volume billing and payment transactions. MySQL provides excellent read/write performance for transactional data.
* **Data Integration:** The backend employs a compatibility layer to ensure seamless cross-database operations, allowing the application to treat the distributed nodes as a single logical entity while maintaining physical distribution.

---

### 9. System Design

#### 3.1 Data Models
The system employs a distributed database model separated into two distinct engines:

**1. `wasco_core` Database (PostgreSQL - Customer focus)**
* **`users` Table:** Handles authentication (email, encrypted password, role matching).
* **`customers` Table:** Records physical attributes (Account number, name, phone, linked to a specific district).
* **`districts` Table:** Catalogues the districts of Lesotho (Maseru, Berea, Leribe, etc.).
* **`leakage_reports` Table:** Tracks user-reported water bursts mapped to specific account addresses.

**2. `wasco_billing` Database (MySQL - Financial focus)**
* **`billing_rates` Table:** Defines the block tariffs (e.g., Tier 1: 0-5 $m^3$, Tier 2: 6-20 $m^3$).
* **`bills` Table:** Logs previous and current meter readings, total consumed $m^3$, calculated amount due, and the payment status.
* **`payments` Table:** Logs transactional data tied to a `bill_id`. Tracks the amount paid, method used, and a unique tracking reference number.

#### 3.2 Entity Relationship Diagram (ERD)
The following diagram illustrates the distributed relationship between the **Core Node** (PostgreSQL) and the **Billing Node** (MySQL).

```mermaid
erDiagram
    USERS {
        int id PK
        string email
        string role
    }
    CUSTOMERS {
        string account_number PK
        int user_id FK
        int district_id FK
        string full_name
    }
    DISTRICTS {
        int district_id PK
        string name
    }
    LEAKAGE_REPORTS {
        int report_id PK
        string account_number FK
        string status
    }
    BILLS {
        int bill_id PK
        string account_number FK
        decimal amount_due
        string status
    }
    PAYMENTS {
        int payment_id PK
        int bill_id FK
        decimal amount_paid
    }

    USERS ||--|| CUSTOMERS : "manages"
    DISTRICTS ||--o{ CUSTOMERS : "located in"
    CUSTOMERS ||--o{ LEAKAGE_REPORTS : "submits"
    CUSTOMERS ..o{ BILLS : "logical_link"
    BILLS ||--o{ PAYMENTS : "settles"
```
*Figure 1: Distributed Entity Relationship Diagram (ERD)*

---

### 10. System Implementation

#### 4.1 Cross-Database Integration
[ INSERT SYSTEM ARCHITECTURE DIAGRAM HERE ]
*Figure 2: Distributed Node.js / Heterogeneous Database Architecture*

The system achieves distribution by maintaining two separate database connections within the Node.js backend. A custom middleware layer handles the "Join" operations at the application level. For example, when generating a bill, the system fetches the customer's account details from **PostgreSQL** and then computes the financial transaction in **MySQL**, ensuring that both data nodes remain synchronized without being physically tied to the same engine.

#### 4.2 Analytical Views (OLAP)
To meet the requirement for high-level management insights, the system utilizes **Logic via SQL Views**. These views reside in the MySQL billing node and perform heavy aggregations on-the-fly:
* **`usage_analytics`**: Provides monthly breakdowns of water consumption and projected revenue.
* **`daily_usage_analytics`**: Powers the real-time trend charts on the Manager Dashboard.
* **`weekly_usage_analytics`**: Aggregates usage data into weekly blocks for short-term operational monitoring.

By using views, we shift the computational load of data aggregation from the frontend to the database engine, significantly improving application performance.

### 11. Database Security
Security is implemented at both the network and application levels. Database credentials are kept in environment variables, and all SQL queries use **Parameterized Statements** (Prepared Statements) to prevent SQL Injection attacks. Customer passwords are never stored in plain text; instead, they are hashed using the **Bcrypt** algorithm. Furthermore, JWT (JSON Web Tokens) are used to enforce role-based access control (RBAC), ensuring only authorized personnel can access sensitive financial views.

### 12. Results and Testing
The system was tested against various consumption scenarios, including:
1. **Tiered Tariff Calculation**: Verified that a customer using 25 $m^3$ is billed correctly across both the low-usage and high-usage brackets.
2. **Cross-Node Consistency**: Ensured that account identifiers are correctly mapped between the PostgreSQL and MySQL nodes.
3. **Role-Based Access**: Confirmed that customers cannot access the analytical views or tariff adjustment tools intended for managers and admins.

[ INSERT CUSTOMER PORTAL SCREENSHOT HERE ]
*Figure 3: Customer Portal (Leakage Reporting and Bill Viewing)*

[ INSERT MANAGER DASHBOARD SCREENSHOT HERE ]
*Figure 4: Manager Dashboard showing Strategic Analytics (Daily/Weekly/Monthly Trends)*

[ INSERT ADMIN BILL MANAGEMENT SCREENSHOT HERE ]
*Figure 5: Admin Bill Generation Interface with Auto-fill functionality*

---

---

### 13. Conclusion

#### 4.1 Advantages of the System
* **Heterogeneous Scalability:** By utilizing both PostgreSQL and MySQL, the system demonstrates true distributed architecture principles, allowing for different departments to use optimized engines while remaining integrated.
* **Real-time Analytics:** The manager dashboard provides "Strategic Insights" with daily, weekly, monthly, and yearly trends, meeting the requirement for summative information and insights.
* **Resilience & Security:** Separation of financial records from customer profiles minimizes the blast radius of potential compromises. 
* **Accessibility:** Users can report leakages and pay bills from anywhere, improving service delivery and community engagement.

#### 4.2 Future Enhancement of the System
Future iterations of this system could integrate actual physical smart-meter APIs capable of pushing live `meter_reading_current` data directly into the database without human intervention. Furthermore, the payment module can be directly hooked up to standard authentic gateways like the actual Vodacom M-Pesa Developer API.

#### 4.3 Potential Benefit
WASCO branches benefit from an immediate reduction in administrative workload and significantly enhanced insights into water consumption patterns per district. The people of Lesotho benefit from unprecedented transparency regarding how their exact consumption determines their monthly cost.

#### 4.4 Conclusion
Applying database application concepts—ranging from relational logic, embedded SQL, and distributed architecture to frontend web integration—resulted in a highly effective prototype. The project proved that the complex operational requirements of water distribution, consumption modeling, and centralized analytics can be dramatically simplified via well-engineered web database applications.

---

### 15. References
1. Elmasri, R., & Navathe, S. B. (2015). *Fundamentals of Database Systems*. Pearson.
2. PostgreSQL Global Development Group. (2024). *PostgreSQL Documentation*.
3. React Documentation. (2024). *React – A JavaScript library for building user interfaces*.
4. Node.js Foundation. (2024). *Node.js API Reference*.

### 16. Appendices
* Appendix A: Database Initialization Scripts (`wasco_core_schema.sql`, `wasco_billing_schema.sql`)
* Appendix B: Application Code Snippets

**B.1 Analytical View Logic (MySQL)**
```sql
CREATE OR REPLACE VIEW usage_analytics AS
SELECT 
    month, year,
    COUNT(bill_id) as total_bills,
    SUM(usage_m3) as total_usage_m3,
    AVG(usage_m3) as avg_usage_per_customer,
    SUM(amount_due) as projected_revenue
FROM bills
GROUP BY year, month;
```

**B.2 Tiered Billing Calculation (Node.js)**
```javascript
let amountDue = 0;
let remaining = usageM3;
for (const tier of rates.rows) {
  if (remaining <= 0) break;
  const tierMax = tier.max_usage_m3 !== null ? parseFloat(tier.max_usage_m3) : Infinity;
  const consumed = Math.min(remaining, tierMax - tier.min_usage_m3);
  amountDue += consumed * parseFloat(tier.cost_per_m3);
  remaining -= consumed;
}
```
