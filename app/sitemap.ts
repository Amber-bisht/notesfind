import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import SubCategory from '@/models/SubCategory';
import Note from '@/models/Note';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://notesfind.com';

    // Static pages
    const routes = [
        '',
        '/auth',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
    }));

    try {
        await dbConnect();
        // Categories
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const categories = await Category.find({}, 'slug updatedAt').lean() as any[];
        const categoryRoutes = categories.map((c) => ({
            url: `${baseUrl}/${c.slug}`,
            lastModified: c.updatedAt,
        }));

        // SubCategories
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subCategories = await SubCategory.find({}).populate('categoryId', 'slug').lean() as any[];
        const subRoutes = subCategories
            .filter((s) => s.categoryId)
            .map((s) => ({
                url: `${baseUrl}/${s.categoryId.slug}/${s.slug}`,
                lastModified: s.updatedAt,
            }));

        // Notes
        const notes = await Note.find({ isPublished: true }).populate({
            path: 'subCategoryId',
            populate: { path: 'categoryId' }
        }).sort({ createdAt: -1 }).limit(1000).lean() as any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

        const noteRoutes = notes
            .filter((n) => n.subCategoryId && n.subCategoryId.categoryId)
            .map((n) => ({
                url: `${baseUrl}/${n.subCategoryId.categoryId.slug}/${n.subCategoryId.slug}/${n.slug}`,
                lastModified: n.updatedAt,
            }));

        return [...routes, ...categoryRoutes, ...subRoutes, ...noteRoutes];
    } catch {
        console.warn('DB connection failed for sitemap gen');
        return routes;
    }
}
