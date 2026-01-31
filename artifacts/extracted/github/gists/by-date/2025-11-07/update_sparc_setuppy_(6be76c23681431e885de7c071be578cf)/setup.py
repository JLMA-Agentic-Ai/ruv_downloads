from setuptools import setup, find_packages
from pathlib import Path
# Read the contents of README.md
this_directory = Path(__file__).parent
long_description = (this_directory / "README.md").read_text()
setup(
    name='sparc',
    version='0.87.6',
    packages=['sparc_cli'] + ['sparc_cli.' + pkg for pkg in find_packages('sparc_cli')],
    package_dir={'sparc_cli': 'sparc_cli'},
    install_requires=[
        'twine',
        'setuptools',
        'wheel',
        'flake8',
        'black',
        'pytest',
        'pip-upgrader',
        'httpx',
        'beautifulsoup4',
        'pypandoc',
        'playwright',
        'langchain-core',
        'numpy',
        'sympy',
        'langchain',
    ],
    author='rUv',
    author_email='ruv@ruv.net',
    description='SPARC CLI is a powerful command-line interface that implements the SPARC Framework methodology for AI-assisted software development.',
    long_description=long_description,
    long_description_content_type='text/markdown',
    url='https://github.com/ruvnet/sparc',
    license='Apache License 2.0',
    entry_points={
        'console_scripts': [
            'sparc=sparc_cli.__main__:main',
        ],
    },
)
