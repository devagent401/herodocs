// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	server: { port: 4321, host: '127.0.0.1' },
	redirects: { '/': '/start/overview/' },
	integrations: [
		starlight({
			pagefind: false,
			components: { Search: './src/components/Search.astro' },
			title: 'HeroCloud Docs',
			description: 'What HeroCloud does, feature by feature, with screenshots.',
			sidebar: [
				{ label: 'Start here', items: [{ autogenerate: { directory: 'start' } }] },
				{ label: 'Workspace', items: [{ autogenerate: { directory: 'workspace' } }] },
				{ label: 'Pipeline', items: [{ autogenerate: { directory: 'pipeline' } }] },
				{ label: 'Operations', items: [{ autogenerate: { directory: 'operations' } }] },
				{ label: 'Intelligence', items: [{ autogenerate: { directory: 'intelligence' } }] },
				{ label: 'Admin', items: [{ autogenerate: { directory: 'admin' } }] },
				{ label: 'System', items: [{ autogenerate: { directory: 'system' } }] },
			],
		}),
	],
});
