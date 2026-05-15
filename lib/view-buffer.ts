import dbConnect from "./db";
import Note from "@/models/Note";

// This object stays in the server's memory while the process is running
// It stores: { "noteId": count }
let viewBuffer: Record<string, number> = {};
let isSyncing = false;

/**
 * Adds a view to the in-memory buffer. 
 * Extremely fast, no DB connection needed here.
 */
export function bufferView(noteId: string) {
    if (!viewBuffer[noteId]) {
        viewBuffer[noteId] = 0;
    }
    viewBuffer[noteId]++;
}

/**
 * Flushes all buffered views to the database in a single pass.
 */
export async function flushViews() {
    if (isSyncing || Object.keys(viewBuffer).length === 0) return;

    isSyncing = true;
    console.log(`[ViewBuffer] Flushing ${Object.keys(viewBuffer).length} notes to DB...`);

    try {
        await dbConnect();
        
        // Take a snapshot of the current buffer
        const currentBuffer = { ...viewBuffer };
        const ops = Object.entries(currentBuffer).map(([id, count]) => ({
            updateOne: {
                filter: { _id: id },
                update: { $inc: { views: count } }
            }
        }));

        // Reset the buffer for NEW incoming views
        viewBuffer = {};

        await Note.bulkWrite(ops);
        console.log(`[ViewBuffer] Successfully synced ${ops.length} notes to database.`);
    } catch (error) {
        // If it fails, we should ideally put them back or log them for manual recovery
        console.error("[ViewBuffer] Error flushing views:", error);
        // Note: In a production app, you might want to merge currentBuffer back into viewBuffer
    } finally {
        isSyncing = false;
    }
}

// Automatically flush every 60 seconds
if (process.env.NODE_ENV !== 'test') {
    if (!(global as any).viewBufferInterval) {
        (global as any).viewBufferInterval = setInterval(flushViews, 60000);
        console.log("[ViewBuffer] Background sync initialized (60s interval).");
    }
}
