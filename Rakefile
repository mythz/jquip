JQUIP_ROOT = File.expand_path(File.dirname(__FILE__))
JQUIP_SRC_DIR = File.join(JQUIP_ROOT, 'src')
JQUIP_DIST_DIR = File.join(JQUIP_ROOT, 'dist')
JQUIP_COMPONENTS = %w(jquip.core jquip.ajax jquip.css jquip.custom jquip.docready)

task :default => [:clean, :concat, :dist]

desc 'Clean the distribution directory.'
task :clean do
  rm_rf JQUIP_DIST_DIR
  mkdir JQUIP_DIST_DIR
end

def normalize_whitespace(filename)
  contents = File.readlines(filename)
  contents.each { |line| line.sub!(/\s+$/, '') }
  File.open(filename, 'w') do |file|
    file.write contents.join("\n").sub(/(\n+)?\Z/m, "\n")
  end
end

desc 'Strip trailing whitespace and ensure each file ends with a newline'
task :whitespace do
  Dir['src/**/*'].each do |filename|
    normalize_whitespace(filename) if File.file?(filename)
  end
end

desc 'Concatenate source files to build jquip.js'
task :concat, [:addons] => :whitespace do |task, args|
  # colon-separated arguments such as `concat[foo:bar:-baz]` specify
  # which components to add or exclude, depending on if it starts with '-'
  add, exclude = args[:addons].to_s.split(':').partition { |c| c !~ /^-/ }
  exclude.each { |c| c.sub!('-', '') }
  components = (JQUIP_COMPONENTS | add) - exclude

  unless components == JQUIP_COMPONENTS
    puts "Building jquip.js by including: #{components.join(', ')}"
  end

  File.open(File.join(JQUIP_DIST_DIR, 'jquip.js'), 'w') do |f|
    f.puts components.map { |component|
      File.read File.join(JQUIP_SRC_DIR, "#{component}.js")
    }
  end
end

def uglifyjs(src, target)
  begin
    require 'uglifier'
  rescue LoadError => e
    if verbose
      puts "\nYou'll need the 'uglifier' gem for minification. Just run:\n\n"
      puts "  $ gem install uglifier"
      puts "\nand you should be all set.\n\n"
      exit
    end
    return false
  end
  puts "Minifying #{src} with UglifyJS..."
  File.open(target, 'w'){ |f| f.puts Uglifier.new.compile(File.read(src)) }
end

def process_minified(src, target)
  cp target, File.join(JQUIP_DIST_DIR, 'temp.js')
  msize = File.size(File.join(JQUIP_DIST_DIR, 'temp.js'))
  `gzip -9 #{File.join(JQUIP_DIST_DIR, 'temp.js')}`

  osize = File.size(src)
  dsize = File.size(File.join(JQUIP_DIST_DIR, 'temp.js.gz'))
  rm_rf File.join(JQUIP_DIST_DIR, 'temp.js.gz')

  puts "Original version: %.3fk" % (osize/1024.0)
  puts "Minified: %.3fk" % (msize/1024.0)
  puts "Minified and gzipped: %.3fk, compression factor %.3f" % [dsize/1024.0, osize/dsize.to_f]
end

desc 'Generates a minified version for distribution, using UglifyJS.'
task :dist do
  JQUIP_COMPONENTS.map do |component|
    src, target = File.join(JQUIP_SRC_DIR, "#{component}.js"), File.join(JQUIP_DIST_DIR, "#{component}.min.js")
    uglifyjs src, target
  end

  src, target = File.join(JQUIP_DIST_DIR, 'jquip.js'), File.join(JQUIP_DIST_DIR, 'jquip.min.js')
  uglifyjs src, target
  process_minified src, target
end
