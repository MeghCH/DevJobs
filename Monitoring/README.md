# Monitoring and Logging

This directory contains the configuration for monitoring and logging tools for the Job Aggregator Platform.

## Overview

The monitoring setup includes:
- **Prometheus**: For metrics collection and storage.
- **Grafana**: For visualization and dashboards.
- **Node Exporter**: For system-level metrics.

## Setup

### Prerequisites
- Docker
- Docker Compose

### Running Monitoring Services

To start the monitoring services, run the following command:

```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### Accessing Services

- **Prometheus**: Open your browser and navigate to `http://localhost:9090`.
- **Grafana**: Open your browser and navigate to `http://localhost:3002`.

## Configuration

### Prometheus

Prometheus is configured to scrape metrics from the following targets:
- Prometheus itself
- Node Exporter
- Backend service
- Frontend service
- AI service

The configuration file is located at `prometheus.yml`.

### Grafana

Grafana is configured to use Prometheus as its data source. After starting Grafana, you need to add Prometheus as a data source:

1. Open Grafana in your browser.
2. Navigate to **Configuration** > **Data Sources**.
3. Click **Add data source**.
4. Select **Prometheus**.
5. Set the URL to `http://prometheus:9090`.
6. Click **Save & Test**.

### Node Exporter

Node Exporter is configured to collect system-level metrics from the host machine. It is automatically discovered by Prometheus.

## Dashboards

### Creating Dashboards in Grafana

To create a dashboard in Grafana:

1. Open Grafana in your browser.
2. Navigate to **Create** > **Dashboard**.
3. Click **Add new panel**.
4. Select the metrics you want to visualize.
5. Customize the panel as needed.
6. Click **Apply** to save the panel.

### Example Dashboards

Here are some example dashboards you can create:

#### System Metrics Dashboard
- **CPU Usage**: `100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)`
- **Memory Usage**: `100 - (node_memory_MemFree_bytes / node_memory_MemTotal_bytes * 100)`
- **Disk Usage**: `100 - (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100)`

#### Application Metrics Dashboard
- **HTTP Requests**: `sum(rate(http_requests_total[1m])) by (job)`
- **HTTP Request Duration**: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[1m])) by (le, job))`
- **Error Rate**: `sum(rate(http_requests_total{status=~"5.."}[1m])) / sum(rate(http_requests_total[1m])) * 100`

## Logging

### Backend Logging

The backend service logs are configured to output to the console and can be viewed using Docker logs:

```bash
docker logs jobaggregator-backend
```

### Frontend Logging

The frontend service logs are configured to output to the console and can be viewed using Docker logs:

```bash
docker logs jobaggregator-frontend
```

### AI Service Logging

The AI service logs are configured to output to the console and can be viewed using Docker logs:

```bash
docker logs jobaggregator-ai
```

## Alerting

### Prometheus Alert Rules

To set up alerting in Prometheus, add alert rules to the `prometheus.yml` file:

```yaml
rule_files:
  - 'alert.rules'
```

Create an `alert.rules` file with your alert rules:

```yaml
groups:
- name: example
  rules:
  - alert: HighErrorRate
    expr: job:request_latency_seconds:mean5m{job="backend"} > 0.5
    for: 10m
    labels:
      severity: page
    annotations:
      summary: High request latency on {{ $labels.job }}
```

### Grafana Alerts

To set up alerts in Grafana:

1. Open Grafana in your browser.
2. Navigate to **Alerting** > **Alert rules**.
3. Click **New alert rule**.
4. Configure the alert rule as needed.
5. Click **Save**.

## Troubleshooting

### Common Issues

- **Prometheus Not Scraping Targets**: Ensure the targets are correctly configured in `prometheus.yml` and that the services are running.
- **Grafana Not Connecting to Prometheus**: Verify the Prometheus data source configuration in Grafana.
- **Node Exporter Not Collecting Metrics**: Ensure the Node Exporter container has the correct permissions to access system metrics.

### Debugging Tips

- Use `docker logs` to view logs for the monitoring services.
- Use `docker ps` to verify that all monitoring services are running.
- Use `docker network inspect` to verify network connectivity between services.

## Resources

- [Prometheus Documentation](https://prometheus.io/docs/introduction/overview/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Node Exporter Documentation](https://github.com/prometheus/node_exporter)