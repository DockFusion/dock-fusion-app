.ONESHELL:

ifeq ($(OS),Windows_NT)
	ifneq ($(strip $(filter %sh,$(basename $(realpath $(SHELL))))),)
		POSIXSHELL := 1
	else
		POSIXSHELL :=
	endif
else
	# not on windows:
	POSIXSHELL := 1
endif

ifneq ($(POSIXSHELL),)
	CMDSEP := ;
	PSEP := /
	CPF := cp -f
	CLR := clear
	# more variables for commands you need
else
	CMDSEP := &
	PSEP := \\
	CPF := copy /y
	CLR := cls
	# more variables for commands you need
endif

GOALS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
ARGUMENTS := $(if $(args),$(args)$(if $(GOALS), ,),)$(GOALS)

up:
	@npm run up

react:
	@npm run start

electron:
	@npm run electron
