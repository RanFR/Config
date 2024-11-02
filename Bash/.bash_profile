# ~/.bash_profile

# load .profile
if [ -f ~/.profile ]; then
    . ~/.profile
fi

# set fcitx
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS=@im=fcitx
