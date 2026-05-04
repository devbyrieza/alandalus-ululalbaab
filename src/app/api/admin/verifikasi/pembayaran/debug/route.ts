import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/session";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession() as any;
        if (!session || !["admin", "admin_super", "admin_keuangan"].includes(session.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const STORAGE_DIR = process.env.STORAGE_PATH 
            ? path.resolve(process.env.STORAGE_PATH) 
            : path.resolve(process.cwd(), 'storage_data');

        const debugInfo = {
            currentTime: new Date().toISOString(),
            cwd: process.cwd(),
            env_storage_path: process.env.STORAGE_PATH || 'not set',
            resolved_storage_dir: STORAGE_DIR,
            exists: fs.existsSync(STORAGE_DIR),
            contents: fs.existsSync(STORAGE_DIR) ? fs.readdirSync(STORAGE_DIR) : [],
        };

        // Recursive check for subfolders
        const categories = debugInfo.contents;
        const subContents: any = {};
        for (const cat of categories) {
            const catPath = path.join(STORAGE_DIR, cat);
            if (fs.statSync(catPath).isDirectory()) {
                const subfolders = fs.readdirSync(catPath);
                subContents[cat] = {};
                for (const sub of subfolders) {
                    const subPath = path.join(catPath, sub);
                    if (fs.statSync(subPath).isDirectory()) {
                        subContents[cat][sub] = fs.readdirSync(subPath);
                    } else {
                        // It's a file directly in the category (old system)
                        if (!subContents[cat]._files) subContents[cat]._files = [];
                        subContents[cat]._files.push(sub);
                    }
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            debug: { ...debugInfo, subContents } 
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
