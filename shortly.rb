require 'sinatra'
require "sinatra/reloader" if development?
require 'active_record'
require 'digest/sha1'
require 'pry'
require 'uri'
require 'open-uri'
require 'bcrypt'

enable :sessions

userTable = {}

# require 'nokogiri'

###########################################################
# Configuration
###########################################################

set :public_folder, File.dirname(__FILE__) + '/public'

configure :development, :production do
    ActiveRecord::Base.establish_connection(
       :adapter => 'sqlite3',
       :database =>  'db/dev.sqlite3.db'
     )
end

# Handle potential connection pool timeout issues
after do
    ActiveRecord::Base.connection.close
end

# turn off root element rendering in JSON
ActiveRecord::Base.include_root_in_json = false

###########################################################
# Models
###########################################################
# Models to Access the database through ActiveRecord.
# Define associations here if need be
# http://guides.rubyonrails.org/association_basics.html

class Link < ActiveRecord::Base
    attr_accessible :url, :code, :visits, :title

    has_many :clicks

    validates :url, presence: true

    before_save do |record|
        record.code = Digest::SHA1.hexdigest(url)[0,5]
    end
end

class Click < ActiveRecord::Base
    belongs_to :link, counter_cache: :visits
end

###########################################################
# Routes
###########################################################
helpers do
  def login?
    if session[:username].nil?
      return false
    else
      return true
    end
  end

  def username
    return session[:username]
  end

end

get '/' do
  @message = "Please sign in"
  erb :signIn
end

get '/index' do
  if login?
    erb :index
  else
    erb :signIn
  end
end

get '/shorten' do
  if login?
    erb :index
  else
    erb :signIn
  end
end

post '/signup' do
  password_salt = BCrypt::Engine.generate_salt
  password_hash = BCrypt::Engine.hash_secret(params[:password], password_salt)

  if userTable[params[:username]].nil?
    userTable[params[:username]] = {:password => password_hash, :password_salt => password_salt}
    redirect '/index'
    session[:username] = username
  else
    erb(:signIn, {message => "Already a username, sorry"})
  end
end

get '/signin' do
  password = params[:password]
  username = params[:username]
  puts userTable[username]
  puts username
  if userTable[username].nil?
    @message = "Not a username, sorry"
    erb :signIn
  else
    password_salt = userTable[username][:password_salt]
    password_hash = BCrypt::Engine.hash_secret(password, password_salt)

    if password_hash == userTable[username][:password]
        session[:username] = username
        redirect '/index'
    else
      @message = "Incorrect password"
      erb :signIn
    end
  end
end

get '/logout' do
  session[:username] = nil
  erb(:signIn, {message => "You logged out successfully"})
end



get '/links' do
    links = Link.order("created_at DESC")
    links.map { |link|
        link.as_json.merge(base_url: request.base_url)
    }.to_json
end

post '/links' do
    data = JSON.parse request.body.read
    uri = URI(data['url'])
    raise Sinatra::NotFound unless uri.absolute?
    link = Link.find_by_url(uri.to_s) ||
           Link.create( url: uri.to_s, title: get_url_title(uri) )
    link.as_json.merge(base_url: request.base_url).to_json
end

get '/:url' do
    link = Link.find_by_code params[:url]
    raise Sinatra::NotFound if link.nil?
    link.clicks.create!
    redirect link.url
end

###########################################################
# Utility
###########################################################

def read_url_head url
    head = ""
    url.open do |u|
        begin
            line = u.gets
            next  if line.nil?
            head += line
            break if line =~ /<\/head>/
        end until u.eof?
    end
    head + "</html>"
end

def get_url_title url
    # Nokogiri::HTML.parse( read_url_head url ).title
    result = read_url_head(url).match(/<title>(.*)<\/title>/)
    result.nil? ? "" : result[1]
end
