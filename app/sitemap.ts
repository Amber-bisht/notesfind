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
        const categories = await Category.find({}, 'slug updatedAt').lean();
        const categoryRoutes = categories.map((c: any) => ({
            url: `${baseUrl}/${c.slug}`,
            lastModified: c.updatedAt,
        }));

        // SubCategories
        const subCategories = await SubCategory.find({}).populate('categoryId', 'slug').lean();
        const subRoutes = subCategories
            .filter((s: any) => s.categoryId)
            .map((s: any) => ({
                url: `${baseUrl}/${s.categoryId.slug}/${s.slug}`,
                lastModified: s.updatedAt,
            }));

        // Notes
        const notes = await Note.find({ isPublished: true }).populate({
            path: 'subCategoryId',
            populate: { path: 'categoryId' }
        }).sort({ createdAt: -1 }).limit(1000).lean();

        const noteRoutes = notes
            .filter((n: any) => n.subCategoryId && n.subCategoryId.categoryId)
            .map((n: any) => ({
                url: `${baseUrl}/${n.subCategoryId.categoryId.slug}/${n.subCategoryId.slug}/${n.slug}`,
                lastModified: n.updatedAt,
            }));

        return [...routes, ...categoryRoutes, ...subRoutes, ...noteRoutes];
    } catch (e) {
        console.warn('DB connection failed for sitemap gen');
        return routes;
    }
}
