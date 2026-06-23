-- Update commissioner passcode to a new bcrypt hash.
update public.app_config
set value = extensions.crypt('admin', extensions.gen_salt('bf'))
where key = 'commissioner_passcode';
