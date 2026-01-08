/**
 * ROS3 Interface - Mock implementation for demonstration
 * In production, this would interface with the Rust native bindings
 */
export interface Pose {
    x: number;
    y: number;
    z: number;
    roll: number;
    pitch: number;
    yaw: number;
}
export interface ObjectDetection {
    class: string;
    confidence: number;
    bbox: [number, number, number, number];
}
export interface LidarData {
    points: Array<{
        x: number;
        y: number;
        z: number;
    }>;
    intensities: number[];
    timestamp: number;
}
export declare class ROS3Interface {
    constructor();
    moveToPose(pose: Pose, speed?: number, frame?: 'base' | 'world'): Promise<void>;
    getLidarData(filter?: 'all' | 'obstacles' | 'ground', maxPoints?: number): Promise<LidarData>;
    detectObjects(camera: 'front' | 'left' | 'right' | 'rear', confidenceThreshold?: number): Promise<ObjectDetection[]>;
    getCurrentPose(): Promise<Pose>;
    getStatus(): Promise<{
        status: string;
        health: string;
    }>;
}
//# sourceMappingURL=interface.d.ts.map