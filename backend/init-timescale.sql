-- FleetTracker Pro Mobile GPS Data Optimization
-- This script sets up optimized storage and querying for mobile GPS tracking data
-- No TimescaleDB needed - using standard PostgreSQL with mobile-optimized indexes

-- Create database user if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'fleettracker') THEN
        CREATE ROLE fleettracker WITH LOGIN PASSWORD 'password123';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE fleettracker TO fleettracker;

-- GPS tracking data optimized for mobile devices
CREATE TABLE IF NOT EXISTS gps_tracks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    driver_id UUID,
    trip_id UUID,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    altitude DECIMAL(8,2),
    heading DECIMAL(5,2),
    speed DECIMAL(5,2),
    location VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Indonesia',
    accuracy DECIMAL(5,2),
    satellites INTEGER DEFAULT 0,
    hdop DECIMAL(3,1),
    ignition_on BOOLEAN DEFAULT false,
    engine_on BOOLEAN DEFAULT false,
    moving BOOLEAN DEFAULT false,
    idle_time INTEGER DEFAULT 0,
    fuel_level DECIMAL(5,2),
    fuel_consumption DECIMAL(8,2),
    distance DECIMAL(10,2),
    odometer DECIMAL(10,2),
    harsh_braking BOOLEAN DEFAULT false,
    rapid_acceleration BOOLEAN DEFAULT false,
    sharp_cornering BOOLEAN DEFAULT false,
    speeding BOOLEAN DEFAULT false,
    idling BOOLEAN DEFAULT false,
    speed_limit DECIMAL(5,2),
    speed_violation BOOLEAN DEFAULT false,
    violation_severity VARCHAR(20),
    in_geofence BOOLEAN DEFAULT false,
    geofence_id UUID,
    geofence_name VARCHAR(255),
    geofence_event VARCHAR(50),
    raw_data JSONB,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create optimized indexes for mobile GPS data queries
-- Index for recent GPS tracks (last 30 days)
CREATE INDEX IF NOT EXISTS idx_gps_tracks_recent 
ON gps_tracks (vehicle_id, timestamp DESC) 
WHERE timestamp > NOW() - INTERVAL '30 days';

-- Index for GPS tracks by accuracy (for data quality analysis)
CREATE INDEX IF NOT EXISTS idx_gps_tracks_accuracy 
ON gps_tracks (accuracy, timestamp DESC) 
WHERE accuracy > 0;

-- Index for moving vehicles only
CREATE INDEX IF NOT EXISTS idx_gps_tracks_moving 
ON gps_tracks (vehicle_id, timestamp DESC) 
WHERE moving = true;

-- Index for violation events
CREATE INDEX IF NOT EXISTS idx_gps_tracks_violations 
ON gps_tracks (vehicle_id, timestamp DESC) 
WHERE harsh_braking = true OR rapid_acceleration = true OR speeding = true;

-- Index for geofence events
CREATE INDEX IF NOT EXISTS idx_gps_tracks_geofence 
ON gps_tracks (geofence_id, timestamp DESC) 
WHERE in_geofence = true;

-- Index for coordinates (for proximity searches)
CREATE INDEX IF NOT EXISTS idx_gps_tracks_coordinates 
ON gps_tracks (latitude, longitude, timestamp DESC);

-- Fuel consumption tracking table (mobile optimized)
CREATE TABLE IF NOT EXISTS fuel_consumption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    driver_id UUID,
    trip_id UUID,
    fuel_level DECIMAL(5,2) NOT NULL,
    fuel_consumed DECIMAL(6,2),
    fuel_cost DECIMAL(10,2),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    location VARCHAR(255),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indonesian specific fields
    fuel_type VARCHAR(20),
    gas_station VARCHAR(100),
    gas_station_latitude DECIMAL(10,8),
    gas_station_longitude DECIMAL(11,8),
    price_per_liter DECIMAL(8,2)
);

-- Create indexes for fuel consumption
CREATE INDEX IF NOT EXISTS idx_fuel_consumption_vehicle_time 
ON fuel_consumption (vehicle_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_fuel_consumption_driver_time 
ON fuel_consumption (driver_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_fuel_consumption_cost 
ON fuel_consumption (fuel_cost, timestamp DESC);

-- Driver behavior events (mobile GPS optimized)
CREATE TABLE IF NOT EXISTS behavior_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    trip_id UUID,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    location VARCHAR(255),
    speed_at_event DECIMAL(5,2),
    acceleration DECIMAL(6,3),
    deceleration DECIMAL(6,3),
    g_force DECIMAL(6,3),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indonesian specific fields
    road_condition VARCHAR(50),
    weather_condition VARCHAR(50),
    traffic_condition VARCHAR(50),
    speed_limit_at_location INTEGER,
    violation_duration INTEGER
);

-- Create indexes for behavior events
CREATE INDEX IF NOT EXISTS idx_behavior_events_vehicle_time 
ON behavior_events (vehicle_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_behavior_events_driver_time 
ON behavior_events (driver_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_behavior_events_type 
ON behavior_events (event_type, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_behavior_events_severity 
ON behavior_events (severity, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_behavior_events_coordinates 
ON behavior_events (latitude, longitude, timestamp DESC);

-- Route optimization data (mobile GPS optimized)
CREATE TABLE IF NOT EXISTS route_optimization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    trip_id UUID NOT NULL,
    planned_distance DECIMAL(8,2),
    actual_distance DECIMAL(8,2),
    optimized_distance DECIMAL(8,2),
    planned_duration INTEGER,
    actual_duration INTEGER,
    optimized_duration INTEGER,
    fuel_efficiency DECIMAL(6,3),
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indonesian specific fields
    toll_cost DECIMAL(10,2),
    parking_cost DECIMAL(10,2),
    traffic_jam_duration INTEGER,
    traffic_jam_locations JSONB
);

-- Create indexes for route optimization
CREATE INDEX IF NOT EXISTS idx_route_optimization_vehicle_time 
ON route_optimization (vehicle_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_route_optimization_driver_time 
ON route_optimization (driver_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_route_optimization_trip_id 
ON route_optimization (trip_id, timestamp DESC);

-- Create function to clean up old mobile GPS data (older than 24 months)
CREATE OR REPLACE FUNCTION cleanup_old_mobile_gps_data()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM gps_tracks 
    WHERE timestamp < NOW() - INTERVAL '24 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Cleaned up % old GPS track records', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get mobile GPS statistics
CREATE OR REPLACE FUNCTION get_mobile_gps_stats(vehicle_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS TABLE(
    total_points BIGINT,
    avg_speed DECIMAL,
    max_speed DECIMAL,
    total_distance DECIMAL,
    harsh_braking_count BIGINT,
    rapid_acceleration_count BIGINT,
    speeding_count BIGINT,
    avg_accuracy DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_points,
        ROUND(AVG(speed), 2) as avg_speed,
        ROUND(MAX(speed), 2) as max_speed,
        ROUND(SUM(distance), 2) as total_distance,
        COUNT(CASE WHEN harsh_braking THEN 1 END)::BIGINT as harsh_braking_count,
        COUNT(CASE WHEN rapid_acceleration THEN 1 END)::BIGINT as rapid_acceleration_count,
        COUNT(CASE WHEN speeding THEN 1 END)::BIGINT as speeding_count,
        ROUND(AVG(accuracy), 2) as avg_accuracy
    FROM gps_tracks 
    WHERE vehicle_id = vehicle_uuid 
    AND timestamp > NOW() - (days_back || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Create view for mobile GPS data quality monitoring
CREATE OR REPLACE VIEW mobile_gps_quality AS
SELECT 
    vehicle_id,
    DATE(timestamp) as date,
    COUNT(*) as total_points,
    COUNT(CASE WHEN accuracy <= 10 THEN 1 END) as high_accuracy_points,
    ROUND((COUNT(CASE WHEN accuracy <= 10 THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2) as accuracy_percentage,
    AVG(accuracy) as avg_accuracy,
    MIN(accuracy) as best_accuracy,
    MAX(accuracy) as worst_accuracy
FROM gps_tracks 
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY vehicle_id, DATE(timestamp)
ORDER BY date DESC, vehicle_id;

-- Create view for daily GPS summary
CREATE OR REPLACE VIEW gps_daily_summary AS
SELECT 
    vehicle_id,
    driver_id,
    DATE(timestamp) AS day,
    COUNT(*) AS total_points,
    ROUND(AVG(speed), 2) AS avg_speed,
    ROUND(MAX(speed), 2) AS max_speed,
    ROUND(MIN(speed), 2) AS min_speed,
    ROUND(SUM(distance), 2) AS total_distance,
    ROUND(SUM(fuel_consumption), 2) AS total_fuel_consumed,
    ROUND(AVG(fuel_level), 2) AS avg_fuel_level,
    COUNT(CASE WHEN harsh_braking THEN 1 END) AS harsh_braking_count,
    COUNT(CASE WHEN rapid_acceleration THEN 1 END) AS rapid_acceleration_count,
    COUNT(CASE WHEN speeding THEN 1 END) AS speeding_count
FROM gps_tracks
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY vehicle_id, driver_id, DATE(timestamp)
ORDER BY day DESC, vehicle_id;

-- Create view for weekly driver performance summary
CREATE OR REPLACE VIEW driver_weekly_performance AS
SELECT 
    driver_id,
    DATE_TRUNC('week', timestamp) AS week,
    COUNT(*) AS total_events,
    COUNT(CASE WHEN event_type = 'speeding' THEN 1 END) AS speeding_events,
    COUNT(CASE WHEN event_type = 'harsh_braking' THEN 1 END) AS harsh_braking_events,
    COUNT(CASE WHEN event_type = 'rapid_acceleration' THEN 1 END) AS rapid_acceleration_events,
    COUNT(CASE WHEN severity = 'high' OR severity = 'critical' THEN 1 END) AS critical_events,
    ROUND(AVG(speed_at_event), 2) AS avg_speed,
    ROUND(MAX(speed_at_event), 2) AS max_speed
FROM behavior_events
WHERE timestamp > NOW() - INTERVAL '12 weeks'
GROUP BY driver_id, DATE_TRUNC('week', timestamp)
ORDER BY week DESC, driver_id;

-- Create view for monthly fuel consumption summary
CREATE OR REPLACE VIEW fuel_monthly_summary AS
SELECT 
    vehicle_id,
    driver_id,
    DATE_TRUNC('month', timestamp) AS month,
    ROUND(SUM(fuel_consumed), 2) AS total_fuel_consumed,
    ROUND(SUM(fuel_cost), 2) AS total_fuel_cost,
    ROUND(AVG(price_per_liter), 2) AS avg_price_per_liter,
    COUNT(*) AS refuel_events,
    ROUND(AVG(fuel_level), 2) AS avg_fuel_level
FROM fuel_consumption
WHERE timestamp > NOW() - INTERVAL '12 months'
GROUP BY vehicle_id, driver_id, DATE_TRUNC('month', timestamp)
ORDER BY month DESC, vehicle_id;

-- Grant permissions to fleettracker user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fleettracker;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fleettracker;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO fleettracker;
GRANT ALL PRIVILEGES ON ALL VIEWS IN SCHEMA public TO fleettracker;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Mobile GPS data optimization setup completed!';
    RAISE NOTICE 'Optimized indexes created for mobile GPS tracking';
    RAISE NOTICE 'Data cleanup function created (24-month retention)';
    RAISE NOTICE 'GPS statistics function available';
    RAISE NOTICE 'Data quality monitoring views created';
    RAISE NOTICE 'Performance summary views created';
END
$$;