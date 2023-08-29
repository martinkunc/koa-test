const Koa = require('koa');
const app = new Koa();
require('dotenv').config();
const session = require('koa-session');
const fs = require('fs');
const passport = require('koa-passport')
const bodyParser = require('koa-bodyparser')
const users = [
    { id: 1, username: 'admin', password:'secret' },
    { id: 2, username: 'user', password:'secret' }
]

let numberOfCalls = 0;
let lastMessage = {};

passport.serializeUser(function(user, done) {
    done(null, user.id)
  })
  
  passport.deserializeUser(function(id, done) {
    for(let i=0; i < users.length; i++)
    {
        if (id === users[i].id) {
            done(null, users[i])
            return;
        }
    }
    done(null, null)
    
  })

const LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy(function(username, password, done) {
    for(let i=0; i < users.length; i++)
    {
        if (username === users[i].username && password === users[i].password) {
            done(null, users[i])
            return;
        }
    }
    done(null, false)
}))


async function login(ctx, next) {
    if ('/login' === ctx.path && 'POST' === ctx.method) {
        return passport.authenticate('local', function(err, user, info) {
            if (user === false) {
              ctx.status = 401
              ctx.body = { success: false }
              ctx.throw(401);
            } else {
              ctx.body = { success: true };
              return ctx.login(user)
            }
          })(ctx, next)
    } 
    next();
  };

  async function logout(ctx, next) {
    if ('/logout' === ctx.path) {
        if (ctx.isAuthenticated()) {
            ctx.logout();
            ctx.session = null;
            ctx.body = { success: true };
            return;
          } else {
            ctx.body = { success: false };
            ctx.throw(401);
          }
    } 
    next();
  };

  async function message(ctx, next) {
    if ('/message' === ctx.path && 'POST' === ctx.method) {
        if (ctx.request.body.from && ctx.request.body.to && ctx.request.body.message) {
          numberOfCalls++;
          lastMessage = ctx.request.body.message;
          // retries in production
          await fs.writeFile('lastMessage.json', lastMessage, err => {
            if (err) {
              console.error(err);
            }
          });
          return;
        }

    }
    next();
};

async function stats(ctx, next) {
    if ('/stats' === ctx.path && 'GET' === ctx.method) {
        if (ctx.state.user.id == 1) {
            ctx.body = JSON.stringify({ numberOfCalls: numberOfCalls, lastMessage: lastMessage })
        }
        return;
    }
    next();
};

  async function errorHandler(ctx, next) {
    try {
        await next();
      }
    catch (err) {
        if (401 == err.status) {
            return;
        }
      console.log(`Internal Error ${err}`)
      ctx.body = 'Sorry, something went wrong.';
      ctx.status = 500;
    }
  };

app.keys = ['super-secret-key'];
app.use(session(app));
app.use(errorHandler);
app.use(bodyParser());
app.use(passport.initialize())
app.use(passport.session())

app.use(logout)
app.use(login);

app.use(message);
app.use(stats);


const port = process.env.APP_PORT || 8000
console.log(`Listening on http://127.0.0.1:${port}`)
app.listen(port)


