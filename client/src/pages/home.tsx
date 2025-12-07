import { Layout } from '@/components/layout'
import { Dropzone } from '@/components/dropzone'
import { motion } from 'framer-motion'
import generatedImage from '/abstract_geometric_gradient_background.png'

export default function Home() {
  return (
    <Layout>
      <div className="relative min-h-[calc(100vh-64px)] flex flex-col items-center justify-center overflow-hidden">
        {/* Background Assets */}
        <div className="absolute inset-0 z-0">
          <img
            src={generatedImage}
            alt="Background"
            className="w-full h-full object-cover opacity-20 dark:opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
        </div>

        <div className="container relative z-10 px-4 py-20 flex flex-col items-center gap-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              v1.0 Now Available
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-balance bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60">
              Turn Video Moments into{' '}
              <span className="text-primary">Perfect GIFs</span>
            </h1>

            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Fast, private, and powerful. Convert MP4, MOV, and WebM to
              high-quality animated GIFs directly in your browser. No server
              uploads.
            </p>
          </motion.div>

          <Dropzone />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 text-center mt-8"
          >
            {[
              { label: 'Privacy First', desc: '100% Client-side' },
              { label: 'High Quality', desc: 'Optimized Colors' },
              { label: 'Lightning Fast', desc: 'WASM Powered' },
              { label: 'Free Forever', desc: 'No Watermarks' },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <h4 className="font-bold text-foreground">{item.label}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </Layout>
  )
}
