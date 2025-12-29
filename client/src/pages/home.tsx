import { Layout } from '@/components/layout'
import { Dropzone } from '@/components/dropzone'
import { motion } from 'framer-motion'
import { Link } from 'wouter'
import generatedImage from '/abstract_geometric_gradient_background.png'

export default function Home() {
  return (
    <Layout>
      <div className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center overflow-hidden">
        {/* Background Assets */}
        <div className="absolute inset-0 z-0">
          <img
            src={generatedImage}
            alt="Background"
            className="h-full w-full object-cover opacity-20 dark:opacity-30"
          />
          <div className="from-background via-background/90 to-background absolute inset-0 bg-gradient-to-b" />
        </div>

        <div className="relative z-10 container flex flex-col items-center gap-12 px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl space-y-6"
          >
            <div className="bg-primary/10 text-primary border-primary/20 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium">
              <span className="relative flex h-2 w-2">
                <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"></span>
                <span className="bg-primary relative inline-flex h-2 w-2 rounded-full"></span>
              </span>
              v1.0 Now Available
            </div>

            <h1 className="font-display from-foreground to-foreground/60 bg-gradient-to-b bg-clip-text text-5xl font-bold tracking-tight text-balance text-transparent md:text-7xl">
              Turn Video Moments into{' '}
              <span className="text-primary">Perfect GIFs</span>
            </h1>

            <p className="text-muted-foreground mx-auto max-w-2xl text-xl text-balance">
              Fast, private, and powerful. Convert MP4, MOV, and WebM to
              high-quality animated GIFs directly in your browser. No server
              uploads.{' '}
            </p>
          </motion.div>

          <Dropzone />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="mt-8 grid grid-cols-2 gap-8 text-center md:grid-cols-4 md:gap-16"
          >
            {[
              { label: 'Privacy First', desc: '100% Client-side' },
              { label: 'High Quality', desc: 'Optimized Colors' },
              { label: 'For you', desc: 'My Cassie 💝', link: '/cassie' },
              { label: 'Free Forever', desc: 'No Watermarks' },
            ].map((item, i) =>
              item.link ? (
                <Link key={i} href={item.link}>
                  <div className="cursor-pointer space-y-1 transition-transform hover:scale-105">
                    <h4 className="text-foreground font-bold">{item.label}</h4>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </div>
                </Link>
              ) : (
                <div key={i} className="space-y-1">
                  <h4 className="text-foreground font-bold">{item.label}</h4>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              )
            )}
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
