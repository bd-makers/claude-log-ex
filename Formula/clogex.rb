class Clogex < Formula
  desc "TUI for exploring Claude Code session logs"
  homepage "https://github.com/bd-makers/claude-log-ex"
  version "0.1.9"
  license "MIT"

  on_macos do
    on_arm do
      url "https://github.com/bd-makers/claude-log-ex/releases/download/v#{version}/clogex-macos-arm64"
      sha256 "784766ef8e9357a7dca9b2ab226047b4d73085c7419ae05186e372a20c56dad6"
    end
  end

  def install
    bin.install "clogex-macos-arm64" => "clogex"
  end

  test do
    assert_match "Usage", shell_output("#{bin}/clogex --help 2>&1", 1)
  end
end
