# Insurance-Api

## Overview

This project involves creating a set of APIs and services for managing and processing policy data using MongoDB and Node.js.

## Tasks

### Task 1

1. **API to Upload Data**:
   - Create an API to upload data from XLSX/CSV files into MongoDB.
   - Use worker threads for processing the data.

2. **Search API**:
   - Create an API to search policy info by username.

3. **Aggregated Policy API**:
   - Create an API to provide aggregated policy information by each user.

4. **MongoDB Collections**:
   - Define collections for `Agent`, `User`, `UserAccount`, `PolicyCategory`, `PolicyCarrier`, and `PolicyInfo`.

### Task 2

1. **CPU Utilization Tracking**:
   - Track real-time CPU usage and restart the server if usage exceeds 70%.

2. **Post-Service for Scheduled Messages**:
   - Create a service to insert messages into the database at a specified day and time.

## Setup

1. **Install Dependencies**:
   ```bash
   npm install
