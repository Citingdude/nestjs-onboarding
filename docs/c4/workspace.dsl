workspace {
  name "Wisemen project template"
  !identifiers hierarchical

  model {
    orgAdmin = person "Organization Admin" {
      tags "Admin"
    }

    user = person "Application User" {
      tags "User"
      description "Interacts with the system through web/mobile apps"
    }

    // Software systems
    signoz = softwareSystem "Signoz" {
      tags "Signoz"
      description "Provides telematics data to the platform"
    }

    mainPlatform = softwareSystem "Project template" {
      tags "Wisemen"
      description "Core application platform"

      ingress = container "Ingress" {
        tags "Ingress" "Kubernetes"
        description "Receives and routes incoming requests"
        technology "Kubernetes"
      }

      database = container "Database" {
        tags "PostgreSQL"
        technology "Postgresql"
        description "Primary data store for application"
      }

      cache = container "Cache" {
        tags "Redis"
        description "Stores cached, frequently used data"
        technology "Redis"
      }

      eventBus = container "Internal Event Bus" {
        tags "Nats"
        description "Streams events/messages throughout the system"
        technology "NATS"
      }

      objectStorage = container "Object Storage" {
        tags "ObjectStorage"
        technology "S3"
        description "Storage for media files and documents"
      }

      webApp = container "Web Application" {
        tags "Vue"
        description "User interface for the platform"
        technology "Vue"
        -> objectStorage "manages media" "HTTPS"
        -> ingress "initiates requests to API"
        -> eventBus "receives live updates" "Websocket"
      }

      otelCollector = container "Otel collector" {
        tags "opentelemetry"
        technology "opentelemetry"
        description "collects logs and telemetry"
        -> signoz
      }

      api = container "API" {
        tags "Node.js"
        technology "Node.js"
        description "Core REST"
        -> database "CRUD operations" "TCP"
        -> cache "store/retrieve cached data" "TCP"
        -> objectStorage "manage files" "HTTPS/S3"
        -> eventBus "produce/consume events"
        -> ingress "requests routed from ingress"
        -> otelCollector "send logs spans" 
      }

      asyncWorker = container "Async Worker" {
        tags "Node.js"
        technology "Node.js"
        description "Performs background processing for asynchronous tasks"
        -> database "reads/writes"
        -> cache "use cache"
        -> objectStorage "store/retrieve files"
        -> eventBus "consume/produce events"
        -> otelCollector "send logs spans" 
      }
    }

    // Relationships to main platform
    orgAdmin -> mainPlatform.webApp "manage users, settings"
    user -> mainPlatform.webApp "use the app"
  }

  views {
    styles {
      !include "default-styles.dsl"
    }

    systemLandscape {
      include *
      default
      title "System Landscape"
      description "High-level overview of the application platform"
    }

    container mainPlatform "mainPlatform" {
      include *
      title "Container View"
      description "Shows the deployable units making up the platform"
    }
  }
}