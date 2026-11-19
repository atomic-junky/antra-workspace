import { App, TFile } from 'obsidian';

export type Frontmatter = Record<string, unknown>;

export function getCachedFrontmatter(app: App, file: TFile): Frontmatter {
    return app.metadataCache.getFileCache(file)?.frontmatter ?? {};
}

export async function updateFrontmatter(
    app: App,
    file: TFile,
    update: (frontmatter: Frontmatter) => void,
): Promise<void> {
    await app.fileManager.processFrontMatter(file, update);
}
