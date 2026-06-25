(function(){
  const form=document.querySelector('.authCard');
  if(!form)return;
  form.querySelector('p').textContent='Sign in with an approved Leridia administrator account.';
  const emailLabel=form.querySelector('label');
  const passwordLabel=document.createElement('label');
  passwordLabel.innerHTML='Password<input id="authPassword" type="password" required minlength="8" autocomplete="current-password">';
  emailLabel.after(passwordLabel);
  const submit=form.querySelector('button.primary');
  submit.textContent='Sign in';
  const create=document.createElement('button');
  create.type='button';
  create.className='linkBtn';
  create.textContent='Create approved admin account';
  create.onclick=signup;
  submit.after(create);

  window.login=async function(e){
    e.preventDefault();
    const message=document.getElementById('authMessage');
    message.textContent='Signing in…';
    const email=document.getElementById('authEmail').value.trim();
    const password=document.getElementById('authPassword').value;
    const {data,error}=await db.auth.signInWithPassword({email,password});
    if(error){message.textContent=error.message;return;}
    await boot(data.session);
  };

  window.signup=async function(){
    const message=document.getElementById('authMessage');
    const email=document.getElementById('authEmail').value.trim();
    const password=document.getElementById('authPassword').value;
    if(!email||password.length<8){message.textContent='Enter an approved email and a password with at least 8 characters.';return;}
    message.textContent='Creating account…';
    const {data,error}=await db.auth.signUp({email,password,options:{emailRedirectTo:location.origin+'/admin'}});
    if(error){message.textContent=error.message;return;}
    if(data.session){await boot(data.session);return;}
    message.textContent='Account created. Confirm the email if requested, then return here and sign in.';
  };
})();