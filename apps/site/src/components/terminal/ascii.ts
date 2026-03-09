export const SIGTERM_SKULL = `
         .--:.                     :---::         
      -*******+-                 =********+-      
    .***********=. :-=+==.      +***********=     
    *************:*+*+****-.:. ==************.    
    *************++**+=****=**++*************:    
    :***************+:*+****=***************=     
     :+*************++*==***=*************+-      
        :************+-****+=************=.       
       =**********+***+==*+-***=+*********-       
       .=*******==-*****+-=****=*=*******+-.      
      :****:=++=*+:*+==+==++=*=-=+===:*****+-     
     .****+-**=:   : -++=+**+      -==++=+=***+    
     :*****=+*=.      =****+       =*********+==   
      +**+==****+==---+****+-==+========+***=     
      :**-=************    ************:++=**-    
     -***+==***+=******---=*****+****+=+**=**=    
    =******=..    :=**********:   .:. =****+=     
    =*****-        :**********:       .==***+     
     +***=         :+.-+--+: +.       .*++**=     
      -**=                            .-**=+.     
        =*-                            :==+-:     
          -=.                         =+-  .:-.   
             :                       .          
`

export const TEMPL3_LOGO = `
  ████████╗███████╗███╗   ███╗██████╗ ██╗    ██████╗
  ╚══██╔══╝██╔════╝████╗ ████║██╔══██╗██║   ╚════ ██╗
     ██║   █████╗  ██╔████╔██║██████╔╝██║     █████╔╝
     ██║   ██╔══╝  ██║╚██╔╝██║██╔═══╝ ██║   ╚═══  ██╗
     ██║   ███████╗██║ ╚═╝ ██║██║     ███████╗██████╔╝
     ╚═╝   ╚══════╝╚═╝     ╚═╝╚═╝     ╚══════╝╚═════╝
`

export const NEOFETCH = `
  ╔════════════════════╗    sigterm@templ3
  ║  ████████████████  ║    ─────────────────
  ║  ██  TEMPL3    ██  ║    OS:      Templ3 OS v0.6.6.6
  ║  ██  >_        ██  ║    Kernel:  Astro 5.17
  ║  ██            ██  ║    Shell:   React Three Fiber
  ║  ████████████████  ║    Uptime:  since 2026
  ║                    ║    Pkgs:    Payload
  ╚══════════╗         ║    Theme:   Soviet Warm [dark]
             ╚═════════╝    Terminal: amber phosphor

  ██ ██ ██ ██ ██ ██ ██ ██
`

export const BSOD = `
  ╔══════════════════════════════════════════════════════╗
  ║                                                      ║
  ║    TEMPL3 OS - CRITICAL ERROR                        ║
  ║                                                      ║
  ║    A fatal exception 0x000DEAD has occurred at       ║
  ║    0028:C0011E69 in SIGTERM_DAEMON.ko                ║
  ║                                                      ║
  ║    The current operation has been terminated.        ║
  ║                                                      ║
  ║    * Press any key to reboot the sanctum.            ║
  ║    * Press Ctrl+\` to attempt recovery.              ║
  ║                                                      ║
  ╚══════════════════════════════════════════════════════╝
`

export const NMAP_OUTPUT = `Starting Nmap 7.94 ( https://nmap.org ) at 2026-03-08 03:14 CET
Scanning localhost (127.0.0.1)...

PORT      STATE    SERVICE
22/tcp    open     ssh (sigterm-secure-shell)
80/tcp    open     http (templ3-webserver)
443/tcp   open     https (magenta-tls)
666/tcp   open     doom (sanctum-daemon)
1337/tcp  open     waste (elite-service)
3000/tcp  open     ppp (payload-cms)
6666/tcp  filtered irc (templeOS-chat)
8080/tcp  open     http-proxy (amber-proxy)
9001/tcp  open     tor-orport (over-9000)

Nmap done: 1 IP address (1 host up) scanned in 0.42s`

export const HELP_TABLE = `Available commands:

  ls              List files in home directory
  apps            List all available applications
  open <app>      Open an application by name
  ./<app>         Run an application (e.g. ./gazette)
  goto <route>    Navigate to a page (e.g. goto /dossier)
  guestbook       Open the guestbook application
  cat sigterm.txt Read operator bio
  whoami          Display operator info
  neofetch        System info with ASCII art
  secret          ♪ Sanctum radio
  hack            Trigger global glitch effect
  sudo rm -rf /   Nice try.
  ping            Ping sigterm.vodka
  nmap            Scan localhost ports
  clear           Clear terminal output
  exit            Close terminal

Tab completion is available for commands and arguments.
Use arrow keys (up/down) to navigate command history.
`

// Mobile versions - reuse same art, let CSS handle scaling
export const SIGTERM_SKULL_MOBILE = SIGTERM_SKULL
export const NEOFETCH_MOBILE = NEOFETCH
export const BSOD_MOBILE = BSOD
